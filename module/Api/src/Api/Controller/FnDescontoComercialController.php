<?php
namespace Api\Controller;

use Zend\View\Model\JsonModel;
use Zend\Db\ResultSet\HydratingResultSet;
use Core\Stdlib\StdClass;
use Core\Hydrator\ObjectProperty;
use Core\Hydrator\Strategy\ValueStrategy;
use Core\Mvc\Controller\AbstractRestfulController;

class FnDescontoComercialController extends AbstractRestfulController
{
    
    /**
     * Construct
     */
    public function __construct()
    {
        
    }

    public function listarempresasAction()
    {
        $data = array();
        
        try {

            $session = $this->getSession();
            $usuario = $session['info'];

            $em = $this->getEntityManager();

            $sql = "
                SELECT ID_EMPRESA, APELIDO AS EMPRESA, NOME FROM MS.EMPRESA WHERE ID_MATRIZ = 1 and APELIDO not in ('CD','M2','TL','SP') ORDER BY EMPRESA
            ";
            
            $conn = $em->getConnection();
            $stmt = $conn->prepare($sql);
            
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }

            $this->setCallbackData($data);
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }

    public function descontofinanceiroAction()
    {
        $data = array();
        
        $emp = $this->params()->fromQuery('emp',null);
        $dtinicio = $this->params()->fromQuery('dtinicio',null);
        $dtfim = $this->params()->fromQuery('dtfim',null);

        $andsql = '';
        $andempsql = '';
        if($emp && $emp != 'EC'){
            $andsql =  "and lx.emp = '$emp' ";
            $andempsql = "and e.apelido = '$emp' ";
        }

        if($dtinicio){
            $andsql .=  "and lx.DATA >= '$dtinicio' ";
            $andempsql .= "and vi.data_emissao >= add_months(to_date('$dtinicio', 'DD/MM/RRRR'), -6) ";
        }else{
            $andempsql .= "and vi.data_emissao >= add_months(to_date(sysdate, 'DD/MM/RRRR'), -6) ";
        }

        if($dtfim){
            $andsql .=  "and lx.DATA <= '$dtfim' ";
        }

        if(!$andsql){
            $andsql = "AND lx.DATA >= sysdate-10 ";
            $andsql .= "AND lx.DATA <= sysdate";
        }

        try {

            $session = $this->getSession();
            $usuario = $session['info'];

            $em = $this->getEntityManager();

            $sql = "select lx.id,
                            lx.emp,
                            lx.id_lote,
                            to_char(lx.data, 'DD/MM/RRRR') data,
                            lx.descricao,
                            lx.valor_debito,
                            lx.valor_credito,
                            lx.complemento,
                            lx.historico,
                            dn.id_lancamento,
                            dn.numero_nota,
                            to_char(nf.data_emissao, 'DD/MM/RRRR') data_emissao,
                            nf.valor,
                            nf.valor_mwm,
                            nf.mb,
                            nf.nome
                    from (SELECT EM.APELIDO||'-'||LC.ID_LOTE||'-'||LC.DATA AS ID,
                                EM.APELIDO AS EMP,
                                --LC.ID_LANCAMENTO,
                                ''||LC.ID_LOTE as ID_LOTE,
                                LC.DATA as DATA,
                                --HP.ID_HP,
                                HP.DESCRICAO,
                                --DECODE(LC.ID_CONTA_DEBITO, 8235, LC.ID_CCUSTO_DEBITO, LC.ID_CCUSTO_CREDITO) as CCUSTO,
                                DECODE(LC.ID_CONTA_DEBITO, 8235, LC.VALOR, NULL) as VALOR_DEBITO,
                                DECODE(LC.ID_CONTA_CREDITO, 8235, LC.VALOR, NULL) as VALOR_CREDITO,
                                LC.COMPLEMENTO_HP AS COMPLEMENTO, 
                                INITCAP(HP.DESCRICAO || ' ' || LC.COMPLEMENTO_HP) HISTORICO
                            FROM MS.EMPRESA EM,
                                 MS.CO_LANCAMENTO LC,
                                 MS.CO_HP HP,
                                 (select id_empresa from ms.empresa where id_matriz = 1) EX
                          WHERE LC.ID_EMPRESA = EM.ID_EMPRESA
                          AND LC.ID_GRUPO_HP = HP.ID_GRUPO_HP
                          AND LC.ID_HP = HP.ID_HP
                          AND LC.ID_GRUPO_PC = 4
                          AND LC.ID_CONTA_DEBITO = 8235
                          AND lc.ID_EMPRESA = EX.id_empresa) lx,
                         FI_DESCONTO_COMERCIAL_NOTA dn,
                         (select e.apelido as emp, vi.numero_nf, vi.id_pessoa, p.nome,
                                trunc(vi.data_emissao) as data_emissao,
                                sum(vi.rob) as valor,
                                sum(case when ic.id_marca in (/*MWM*/23, /*MWM IESA*/539, /*MWM OPCIONAL*/10414) then vi.rob end) valor_mwm,
                                round((sum(nvl(vi.rol,0)-nvl(vi.custo,0))/sum(vi.rol))*100,2) as mb 
                           from pricing.ie_ve_venda_item vi,
                                ms.empresa e,
                                ms.tb_item_categoria ic,
                                ms.tb_item i,
                                ms.tb_categoria c,
                                ms.tb_marca m,
                                ms.pessoa p,
                                FI_DESCONTO_COMERCIAL_NOTA nt
                          where vi.id_empresa = e.id_empresa
                          and vi.id_item = ic.id_item
                          and vi.id_categoria = ic.id_categoria
                          and vi.id_item = i.id_item
                          and vi.id_categoria = c.id_categoria
                          and ic.id_marca = m.id_marca
                          and vi.id_pessoa = p.id_pessoa
                          and vi.id_operacao in (4,7)
                          $andempsql
                          and e.apelido = nt.emp
                          and vi.numero_nf = trim(nt.numero_nota)
                          group by e.apelido, vi.data_emissao, vi.numero_nf, vi.usuario_desconto, vi.id_pessoa, p.id_pessoa, p.nome) nf
                    where lx.id_lote = dn.id_lancamento(+)
                    and lx.emp = dn.emp(+)
                    and dn.emp = nf.emp(+)
                    and trim(dn.numero_nota) = nf.numero_nf(+)
                    $andsql
                    order by lx.data desc";

            $conn = $em->getConnection();
            $stmt = $conn->prepare($sql);
            
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('valor_debito', new ValueStrategy);
            $hydrator->addStrategy('valor_credito', new ValueStrategy);
            $hydrator->addStrategy('valor', new ValueStrategy);
            $hydrator->addStrategy('valor_mwm', new ValueStrategy);
            $hydrator->addStrategy('mb', new ValueStrategy);
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }

            $this->setCallbackData($data);
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }

    public function descontofinanceirocredAction()
    {
        $data = array();
        
        $emp = $this->params()->fromQuery('emp',null);
        $dtinicio = $this->params()->fromQuery('dtinicio',null);
        $dtfim = $this->params()->fromQuery('dtfim',null);

        $andsql = '';
        $andempsql = '';
        if($emp && $emp != 'EC'){
            $andsql =  "and lx.emp = '$emp' ";
            $andempsql = "and e.apelido = '$emp' ";
        }

        if($dtinicio){
            $andsql .=  "and lx.DATA >= '$dtinicio' ";
            $andempsql .= "and c.data_entrada >= add_months(to_date('$dtinicio', 'DD/MM/RRRR'), -6) ";
        }else{
            $andempsql .= "and c.data_entrada >= add_months(to_date(sysdate, 'DD/MM/RRRR'), -6) ";
        }

        if($dtfim){
            $andsql .=  "and lx.DATA <= '$dtfim' ";
        }

        if(!$andsql){
            $andsql = "AND lx.DATA >= sysdate-10 ";
            $andsql .= "AND lx.DATA <= sysdate";
        }

        try {

            $session = $this->getSession();
            $usuario = $session['info'];

            $em = $this->getEntityManager();

            $sql = "select lx.id,
                            lx.emp,
                            lx.id_lote,
                            to_char(lx.data, 'DD/MM/RRRR') data,
                            lx.descricao,
                            lx.valor_debito,
                            lx.valor_credito,
                            lx.complemento,
                            lx.historico,
                            dn.id_lancamento,
                            dn.numero_nota,
                            to_char(nf.data_entrada, 'DD/MM/RRRR') data_entrada,
                            nf.valor,
                            nf.valor_mwm,
                            nf.mb,
                            nf.nome
                    from (SELECT EM.APELIDO||'-'||LC.ID_LOTE||'-'||LC.DATA AS ID,
                                EM.APELIDO AS EMP,
                                --LC.ID_LANCAMENTO,
                                ''||LC.ID_LOTE as ID_LOTE,
                                LC.DATA as DATA,
                                --HP.ID_HP,
                                HP.DESCRICAO,
                                --DECODE(LC.ID_CONTA_DEBITO, 8235, LC.ID_CCUSTO_DEBITO, LC.ID_CCUSTO_CREDITO) as CCUSTO,
                                DECODE(LC.ID_CONTA_DEBITO, 8235, LC.VALOR, NULL) as VALOR_DEBITO,
                                DECODE(LC.ID_CONTA_CREDITO, 8235, LC.VALOR, NULL) as VALOR_CREDITO,
                                LC.COMPLEMENTO_HP AS COMPLEMENTO, 
                                INITCAP(HP.DESCRICAO || ' ' || LC.COMPLEMENTO_HP) HISTORICO
                            FROM MS.EMPRESA EM,
                                MS.CO_LANCAMENTO LC,
                                MS.CO_HP HP,
                                (select id_empresa from ms.empresa where id_matriz = 1) EX
                        WHERE LC.ID_EMPRESA = EM.ID_EMPRESA
                        AND LC.ID_GRUPO_HP = HP.ID_GRUPO_HP
                        AND LC.ID_HP = HP.ID_HP
                        AND LC.ID_GRUPO_PC = 4
                        AND LC.ID_CONTA_CREDITO = 8235
                        AND lc.ID_EMPRESA = EX.id_empresa) lx,
                        FI_DESCONTO_COMERCIAL_NOTA dn,
                        (select e.apelido as emp,
                                c.numero_nota||'-'||c.serie_nota as numero_nf,
                                c.id_pessoa,
                                p.nome,
                                trunc(c.data_entrada) as data_entrada,
                                sum(ci.valor_total * -1) as valor,
                                sum(case when ic.id_marca in (/*MWM*/23, /*MWM IESA*/539, /*MWM OPCIONAL*/10414) then ci.valor_total end) * -1 as valor_mwm
                                --(nvl(ci.valor_custo_compra, 0) * ci.qtde) *-1 as dev_custo,
                                ,null mb
                        from ms.cp_compra c, ms.cp_compra_item ci,
                                ms.devolucao_venda_compra d,
                                ms.ve_vendas v,
                                ms.empresa e,
                                ms.pessoa p,
                                ms.tb_item_categoria ic
                        where c.id_empresa         = ci.id_empresa
                        and c.id_compra          = ci.id_compra
                        and ci.id_empresa        = d.id_empresa
                        and ci.id_compra         = d.id_compra
                        and ci.id_sequencia_item = d.id_seq_compra_item
                        and d.id_venda           = v.id_venda
                        and d.id_empresa         = v.id_empresa
                        and ci.id_empresa        = e.id_empresa
                        and c.id_pessoa          = p.id_pessoa
                        and ci.id_item           = ic.id_item
                        and ci.id_categoria      = ic.id_categoria
                        $andempsql
                        and c.status             = 'A'
                        and c.id_operacao        = 10
                        group by e.apelido, c.numero_nota||'-'||c.serie_nota, trunc(c.data_entrada), c.id_pessoa, p.nome) nf
                    where lx.id_lote = dn.id_lancamento(+)
                    and lx.emp = dn.emp(+)
                    and dn.emp = nf.emp(+)
                    and trim(dn.numero_nota) = nf.numero_nf(+)
                    $andsql
                    order by lx.data desc";

            $conn = $em->getConnection();
            $stmt = $conn->prepare($sql);
            
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('valor_debito', new ValueStrategy);
            $hydrator->addStrategy('valor_credito', new ValueStrategy);
            $hydrator->addStrategy('valor', new ValueStrategy);
            $hydrator->addStrategy('valor_mwm', new ValueStrategy);
            $hydrator->addStrategy('mb', new ValueStrategy);
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }

            $this->setCallbackData($data);
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }

    public function listarnfsAction()
    {
        $data = array();

        $empnf      = $this->params()->fromQuery('empnf',null);
        $nrnf       = $this->params()->fromQuery('nrnf',null);
        $dtinicio   = $this->params()->fromQuery('dtinicio',null);
        $dtfim      = $this->params()->fromQuery('dtfim',null);
        $nome       = $this->params()->fromQuery('nome',null);

        $andsql = "";
        if($empnf){
            $andsql =  "and e.apelido = '$empnf' ";
        }

        if($nrnf){
            $andsql .=  "and vi.numero_nf like '$nrnf%' ";
        }

        if($dtinicio){
            $andsql .=  "and vi.data_emissao >= '$dtinicio' ";
        }
        
        if($dtfim){
            $andsql .=  "and vi.data_emissao <= '$dtfim' ";
        }else{
            $andsql .=  "and vi.data_emissao <= sysdate ";
        }

        if($nome){
            $andsql .=  "and p.nome like '$nome%' ";
        }
        
        try {

            $em = $this->getEntityManager();
            
            $sql = "select e.apelido as emp,
                            vi.numero_nf,
                            vi.id_pessoa,
                            p.nome,
                            to_char(vi.data_emissao, 'DD/MM/RRRR') data_emissao,
                            sum(vi.rob) as valor,
                            sum(case when ic.id_marca in (/*MWM*/23, /*MWM IESA*/539, /*MWM OPCIONAL*/10414) then vi.rob end) valor_mwm, 
                            round((sum(nvl(vi.rol,0)-nvl(vi.custo,0))/sum(vi.rol))*100,2) as mb 
                    from pricing.ie_ve_venda_item vi,
                            ms.empresa e,
                            ms.tb_item_categoria ic,
                            ms.tb_item i,
                            ms.tb_categoria c,
                            ms.tb_marca m,
                            ms.tb_estoque es,
                            ms.pessoa p
                    where vi.id_empresa = e.id_empresa
                    and vi.id_item = ic.id_item
                    and vi.id_categoria = ic.id_categoria
                    and vi.id_item = i.id_item
                    and vi.id_categoria = c.id_categoria
                    and ic.id_marca = m.id_marca
                    and vi.id_empresa = es.id_empresa
                    and vi.id_item = es.id_item
                    and vi.id_categoria = es.id_categoria
                    and vi.id_pessoa = p.id_pessoa
                    and vi.id_operacao in (4,7)
                    and trunc(vi.data_emissao, 'MM') >= '01/01/2019'
                    and vi.id_pessoa >= 1
                    $andsql
                    group by e.apelido, vi.data_emissao, vi.numero_nf, vi.usuario_desconto, vi.id_pessoa, p.id_pessoa, p.nome
                    order by vi.data_emissao desc";

            $conn = $em->getConnection();
            $stmt = $conn->prepare($sql);
            
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('data_emissao', new ValueStrategy);
            $hydrator->addStrategy('valor', new ValueStrategy);
            $hydrator->addStrategy('valor_mwm', new ValueStrategy);
            $hydrator->addStrategy('mb', new ValueStrategy);
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }

            $this->setCallbackData($data);
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }
    public function listarnfscredAction()
    {
        $data = array();

        $empnf      = $this->params()->fromQuery('empnf',null);
        $nrnf       = $this->params()->fromQuery('nrnf',null);
        $dtinicio   = $this->params()->fromQuery('dtinicio',null);
        $dtfim      = $this->params()->fromQuery('dtfim',null);
        $nome       = $this->params()->fromQuery('nome',null);

        $andsql = "";
        if($empnf){
            $andsql =  "and e.apelido = '$empnf' ";
        }

        if($nrnf){
            $andsql .=  "and c.numero_nota||'-'||c.serie_nota like '$nrnf%' ";
        }

        if($dtinicio){
            $andsql .=  "and c.data_entrada >= '$dtinicio' ";
        }
        
        if($dtfim){
            $andsql .=  "and c.data_entrada <= '$dtfim' ";
        }else{
            $andsql .=  "and c.data_entrada <= sysdate ";
        }

        if($nome){
            $andsql .=  "and p.nome like '$nome%' ";
        }
        
        try {

            $em = $this->getEntityManager();
            
            $sql = "select e.apelido as emp,
                            c.numero_nota||'-'||c.serie_nota as numero_nf,
                            to_char(c.data_entrada, 'DD/MM/RRRR')  as data_entrada,
                            c.id_pessoa,
                            p.nome,
                            sum(ci.valor_total * -1) as valor,
                            sum(case when ic.id_marca in (/*MWM*/23, /*MWM IESA*/539, /*MWM OPCIONAL*/10414) then ci.valor_total end) * -1 as valor_mwm
                            --(nvl(ci.valor_custo_compra, 0) * ci.qtde) *-1 as dev_custo,
                    from ms.cp_compra c, ms.cp_compra_item ci,
                            ms.devolucao_venda_compra d,
                            ms.ve_vendas v,
                            ms.empresa e,
                            ms.pessoa p,
                            ms.tb_item_categoria ic
                    where c.id_empresa         = ci.id_empresa
                    and c.id_compra          = ci.id_compra
                    and ci.id_empresa        = d.id_empresa
                    and ci.id_compra         = d.id_compra
                    and ci.id_sequencia_item = d.id_seq_compra_item
                    and d.id_venda           = v.id_venda
                    and d.id_empresa         = v.id_empresa
                    and ci.id_empresa        = e.id_empresa
                    and c.id_pessoa          = p.id_pessoa
                    and ci.id_item           = ic.id_item
                    and ci.id_categoria      = ic.id_categoria
                    $andsql
                    and c.status             = 'A'
                    and c.id_operacao        = 10
                    group by e.apelido, c.numero_nota||'-'||c.serie_nota, to_char(c.data_entrada, 'DD/MM/RRRR'), c.id_pessoa, p.nome
                    order by data_entrada desc";

            $conn = $em->getConnection();
            $stmt = $conn->prepare($sql);
            
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('data_entrada', new ValueStrategy);
            $hydrator->addStrategy('valor', new ValueStrategy);
            $hydrator->addStrategy('valor_mwm', new ValueStrategy);
            $hydrator->addStrategy('mb', new ValueStrategy);
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }

            $this->setCallbackData($data);
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }

    public function inserirvinculonfAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']->usuario_sistema;

            $emp = $this->params()->fromPost('emp',null);
            $idlote = $this->params()->fromPost('idlote',null);
            $dtboleto = $this->params()->fromPost('data',null);
            $nrnf  = $this->params()->fromPost('nrnf',null);
            $dtemissao  = $this->params()->fromPost('dtemissao',null);
            $idpessoa  = $this->params()->fromPost('idpessoa',null);

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql = "select count(*) count from FI_DESCONTO_COMERCIAL_NOTA where emp = '$emp' and numero_nota = '$nrnf'";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $results = $stmt->fetchAll();
            $hydrator = new ObjectProperty;
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }
            
            if($data[0]["count"] != 0 ){
                $this->setCallbackData($data);
                $this->setCallbackError("A NF selecionada já tem lançamento.");
                return $this->getCallbackModel();
            }

            $sql = "call pkg_fi_desconto_com_nota.inserir( :emp, :idlancamento, :numero_nota, :usuario)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':emp', $emp);
            $stmt->bindParam(':idlancamento', $idlote);
            $stmt->bindParam(':numero_nota', $nrnf);
            $stmt->bindParam(':usuario', $usuario);
            $result = $stmt->execute();
            $this->setCallbackData($data);
            $this->setMessage("Solicitação enviada com sucesso.");
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }

    public function alterarvinculonfAction()
    {
        $data = array();
        
        try {
            $session = $this->getSession();
            $usuario = $session['info']->usuario_sistema;

            $emp = $this->params()->fromPost('emp',null);
            $idlote = $this->params()->fromPost('idlote',null);
            $dtboleto = $this->params()->fromPost('data',null);
            $nrnf  = $this->params()->fromPost('nrnf',null);
            $dtemissao  = $this->params()->fromPost('dtemissao',null);
            $idpessoa  = $this->params()->fromPost('idpessoa',null);

            $em = $this->getEntityManager();
            $conn = $em->getConnection();

            $sql = "select count(*) count from FI_DESCONTO_COMERCIAL_NOTA where emp = '$emp' and numero_nota = '$nrnf'";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $results = $stmt->fetchAll();
            $hydrator = new ObjectProperty;
            $stdClass = new StdClass;
            $resultSet = new HydratingResultSet($hydrator, $stdClass);
            $resultSet->initialize($results);

            $data = array();
            foreach ($resultSet as $row) {
                $data[] = $hydrator->extract($row);
            }
            
            if($data[0]["count"] >0){
                $this->setCallbackError("A NF selecionada já tem lançamento.");
                return $this->getCallbackModel();
            }

            $sql = "call pkg_fi_desconto_com_nota.alterar( :emp, :idlancamento, :numero_nota, :usuario)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':emp', $emp);
            $stmt->bindParam(':idlancamento', $idlote);
            $stmt->bindParam(':numero_nota', $nrnf);
            $stmt->bindParam(':usuario', $usuario);
            $result = $stmt->execute();
            $this->setCallbackData($data);
            $this->setMessage("Solicitação enviada com sucesso.");
            
        } catch (\Exception $e) {
            $this->setCallbackError($e->getMessage());
        }
        
        return $this->getCallbackModel();
    }
}
