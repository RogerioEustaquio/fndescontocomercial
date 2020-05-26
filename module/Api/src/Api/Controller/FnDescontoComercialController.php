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
        
        // $emp = $this->params()->fromQuery('emp',null);
        // $dtinicio = $this->params()->fromQuery('dtinicio',null);
        // $dtfim = $this->params()->fromQuery('dtfim',null);

        $emp        = $this->params()->fromPost('emp',null);
        $dtinicio   = $this->params()->fromPost('dtinicio',null);
        $dtfim      = $this->params()->fromPost('dtfim',null);

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
            $andsql = "AND LC.DATA >= sysdate-104 ";
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
                        LC.DATA,
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


    public function listarprodutosAction()
    {
        $data = array();
        
        try {

            $pEmp = $this->params()->fromQuery('emp',null);
            $pCod = $this->params()->fromQuery('codigo',null);

            if(!$pEmp || !$pCod){
                throw new \Exception('Parâmetros não informados.');
            }

            $em = $this->getEntityManager();
            
            $sql = "select distinct em.apelido as emp,
                            i.cod_item||c.descricao as cod_item,
                            i.descricao,
                            m.descricao as marca, 
                            null as preco_venda,
                            e.custo_contabil,
                            e.id_locacao as locacao,
                            nvl(ace.icms,0) as icms,
                            nvl(ic.aliq_pis,0)+nvl(ic.aliq_cofins,0) as pis_cofins,
                            mg.margem
                        from ms.tb_estoque e,
                             ms.tb_item i,
                             ms.tb_categoria c,
                             ms.tb_item_categoria ic,
                             ms.empresa em,
                             ms.tb_marca m,
                             (SELECT ID_EMPRESA, ID_ITEM, ID_CATEGORIA,
                                    EH_ACESSORIO as acessorio,
                                    GERAR_PRECO_VENDA,
                                    (case when EH_ACESSORIO = 'S' then 17 end) as icms
                             FROM MS.TB_ITEM_CATEGORIA_PARAM
                             ) ace,
                             xp_simuladortransf_margem mg
                    where e.id_item = i.id_item
                    and e.id_categoria = c.id_categoria
                    and e.id_empresa = em.id_empresa
                    and e.id_item = ic.id_item
                    and e.id_categoria = ic.id_categoria
                    and ic.id_marca = m.id_marca
                    and e.id_empresa = ace.id_empresa(+)
                    and e.id_item = ace.id_item(+)
                    and e.id_categoria = ace.id_categoria(+)
                    and e.id_empresa = mg.id_empresa
                    and i.cod_item||c.descricao like upper('%$pCod%')
                    and em.apelido = ?
                    and rownum <= 5";

            $conn = $em->getConnection();
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(1, $pEmp);
            
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('custo_contabil', new ValueStrategy);
            $hydrator->addStrategy('icms', new ValueStrategy);
            $hydrator->addStrategy('pis_cofins', new ValueStrategy);
            $hydrator->addStrategy('margem', new ValueStrategy);
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

    public function simulacaotransfAction()
    {
        $data = array();
        
        try {
            $dest = $this->params()->fromQuery('param1',null);
            $orig = $this->params()->fromQuery('param2',null);
            $lprod = $this->params()->fromQuery('param3',null);
            $vfrete  = $this->params()->fromQuery('param4',null);

            if(!$dest){
                $dest   = $this->params()->fromPost('param1',null);
            }
            if(!$orig){
                $orig   = $this->params()->fromPost('param2',null);
            }
            if(!$lprod){
                $lprod   = $this->params()->fromPost('param3',null);
            }
            if(!$vfrete){
                $vfrete   = $this->params()->fromPost('param4',null);
            }

            $listaitens = explode(',',$lprod);
            $lprod='';

            for ($i=0;$i < count($listaitens); $i++) {
                
                if($lprod){
                    $lprod .= ','."'".$listaitens[$i]."'";
                }else{
                    $lprod = "'".$listaitens[$i]."'";
                }
            }

            $session = $this->getSession();
            $usuario = $session['info'];

            $em = $this->getEntityManager();

            $usuario->empresa = 'SA';

            $sql = "select distinct em.apelido as emp,
                            m.descricao as marca,
                            i.cod_item||c.descricao as cod_item,
                            i.descricao,
                            null as frete_rat,
                            null total
                        from ms.tb_estoque e,
                    ms.tb_item i,
                    ms.tb_categoria c,
                    ms.tb_item_categoria ic,
                    ms.empresa em,
                    ms.tb_marca m
                    where e.id_item = i.id_item
                    and e.id_categoria = c.id_categoria
                    and e.id_empresa = em.id_empresa
                    and e.id_item = ic.id_item
                    and e.id_categoria = ic.id_categoria
                    and ic.id_marca = m.id_marca
                    and i.cod_item||c.descricao in ($lprod)
                    and em.apelido = '$dest'";

            $conn = $em->getConnection();
            $stmt = $conn->prepare($sql);
            
            $stmt->execute();
            $results = $stmt->fetchAll();

            $hydrator = new ObjectProperty;
            $hydrator->addStrategy('frete_rat', new ValueStrategy);
            $hydrator->addStrategy('total', new ValueStrategy);
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

}
