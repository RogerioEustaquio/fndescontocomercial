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
                SELECT ID_EMPRESA, APELIDO AS EMPRESA, NOME FROM MS.EMPRESA WHERE ID_MATRIZ = 1 ORDER BY EMPRESA
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

        // $emp        = $this->params()->fromPost('emp',null);
        // $dtinicio   = $this->params()->fromPost('dtinicio',null);
        // $dtfim      = $this->params()->fromPost('dtfim',null);

        $andsql = '';
        if($emp){
            $andsql =  "and em.apelido = '$emp' ";
        }

        if($dtinicio){
            $andsql .=  "and LC.DATA >= '$dtinicio' ";
        }

        if($dtfim){
            $andsql .=  "and LC.DATA <= '$dtfim' ";
        }

        if(!$andsql){
            $andsql = "AND LC.DATA >= sysdate-107 ";
            $andsql .= "AND LC.DATA <= sysdate";
        }

        try {

            $session = $this->getSession();
            $usuario = $session['info'];

            $em = $this->getEntityManager();

            $sql = "select * 
            from (SELECT EM.APELIDO||'-'||LC.ID_LOTE||'-'||LC.DATA AS ID,
                        EM.APELIDO AS EMP,
                        --LC.ID_LANCAMENTO,
                        LC.ID_LOTE,
                        to_char(LC.DATA,'dd/mm/yyyy') as DATA,
                        --HP.ID_HP,
                        HP.DESCRICAO,
                        --DECODE(LC.ID_CONTA_DEBITO, 8235, LC.ID_CCUSTO_DEBITO, LC.ID_CCUSTO_CREDITO) as CCUSTO,
                        DECODE(LC.ID_CONTA_DEBITO, 8235, LC.VALOR, NULL) as VALOR_DEBITO,
                        DECODE(LC.ID_CONTA_CREDITO, 8235, LC.VALOR, NULL) as VALOR_CREDITO,
                        LC.COMPLEMENTO_HP AS COMPLEMENTO, 
                        INITCAP(HP.DESCRICAO || ' ' || LC.COMPLEMENTO_HP) HISTORICO
                            
                    FROM MS.EMPRESA EM, MS.CO_LANCAMENTO LC, MS.CO_HP HP
                    WHERE LC.ID_EMPRESA = EM.ID_EMPRESA
                    AND LC.ID_GRUPO_HP = HP.ID_GRUPO_HP
                    AND LC.ID_HP = HP.ID_HP
                    AND LC.ID_GRUPO_PC = 4
                    AND ((LC.ID_CONTA_DEBITO = 8235) OR (LC.ID_CONTA_CREDITO = 8235))
                    $andsql
                    and lc.ID_EMPRESA in (select id_empresa from ms.empresa where id_matriz = 1)
                    ORDER BY DATA DESC, ID_LANCAMENTO DESC) lx";

            $conn = $em->getConnection();
            $stmt = $conn->prepare($sql);
            
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('VALOR_DEBITO', new ValueStrategy);
            $hydrator->addStrategy('VALOR_CREDITO', new ValueStrategy);
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

        $empnf = $this->params()->fromQuery('empnf',null);
        $nrnf = $this->params()->fromQuery('nrnf',null);
        $dtemissao = $this->params()->fromQuery('dtemissao',null);

        $andsql = "";
        if($empnf){
            $andsql =  "and e.apelido = '$empnf' ";
        }

        if($nrnf){
            $andsql .=  "and vi.numero_nf = '$nrnf' ";
        }

        if($dtemissao){
            $andsql .=  "and to_char(trunc(vi.data_emissao),'dd/mm/yyyy') = '$dtemissao' ";
        }
        
        try {

            $em = $this->getEntityManager();
            
            $sql = "select e.apelido as emp,
                            vi.numero_nf,
                            vi.id_pessoa,
                            p.nome,
                            to_char(trunc(vi.data_emissao),'dd/mm/yyyy') as data_emissao,
                            --sum(vi.qtde) as qtde,
                            --sum(vi.rob_sem_desconto) as robx,
                            --sum(vi.desconto) as desconto,
                            sum(vi.rob) as valor
                            --sum(vi.rol) as rol,
                            --sum(vi.custo) as cmv,
                            --sum(nvl(vi.rol,0)-nvl(vi.custo,0)) as lb,
                            --round((sum(nvl(vi.rol,0)-nvl(vi.custo,0))/sum(vi.rol))*100,2) as mb 
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
                    and vi.id_pessoa = 34829915000126
                    --and vi.numero_nf = '59613-1' 
                    $andsql
                    and rownum <= 5
                    group by e.apelido, vi.data_emissao, vi.numero_nf, vi.usuario_desconto, vi.id_pessoa, p.id_pessoa, p.nome
                    order by vi.data_emissao desc";

            $conn = $em->getConnection();
            $stmt = $conn->prepare($sql);
            
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('valor', new ValueStrategy);
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

    public function vincularnfboletoAction()
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
            $sql = "call pkg_fi_desconto_com_nota.inserir( :idlancamento, :numero_nota, :usuario)";
            $stmt = $conn->prepare($sql);
            // $stmt->bindParam(':emp', $emp);
            $stmt->bindParam(':idlancamento', $idlote);
            // $stmt->bindParam(':dtboleto', $dtboleto);
            $stmt->bindParam(':numero_nota', $nrnf);
            // $stmt->bindParam(':dtemissao', $dtemissao);
            // $stmt->bindParam(':idpessoa', $idpessoa);
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
