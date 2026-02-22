<?php

namespace App\Controllers\Os\Register;

use App\Controllers\FetchController;
use App\Controllers\Os\Libraries\OsValidate;
use App\Controllers\Os\Libraries\CheckOsDelete;
use App\Libraries\Date\DatePeriodResult;
use App\Models\Os\OsRegister_Model;
use App\Models\Os\OsProcedure_Model;
use App\Models\Os\OsStock_Model;
use App\Models\Os\OsComiss_Model;
use App\Models\Os\OsPartner_Model;
use App\Models\Financial\Link\FinLink_Model;
use App\Models\Stock\Register\StockRegister_Model;
use App\Models\Patient\Register\PatientRegister_Model;
use App\Models\Financial\Libraries\OsSet_Model;

class OsRegister extends FetchController
{
    private $libValidate;
    private $libDatePeriod;
    private $modOs;
    private $modOsProcedure;
    private $modOsStock;
    private $modOsComiss;
    private $modOsPartner;
    private $modPatient;

    public function __construct()
    {
        $this->libValidate = new OsValidate();
        $this->libDatePeriod = new DatePeriodResult();
        $this->modOs = new OsRegister_Model();
        $this->modOsProcedure = new OsProcedure_Model();
        $this->modOsStock = new OsStock_Model();
        $this->modOsComiss = new OsComiss_Model();
        $this->modOsPartner = new OsPartner_Model();
        $this->modPatient = new PatientRegister_Model();
    }

    //:RETORNA FETCH DE CADASTRO DE ESTOQUE
    public function getData($osId = null)
    {
        parent::initFetch('76P', false);

        $osId ??= $this->request->getVar("osId");
        $returnData = [];

        //:Busca dados da OS
        $osData = $this->getOs($osId);

        //:Valida acesso à OS
        $validate = $this->libValidate->check(
            $osData->id_prof,
            $osData->id_clinic,
            $osData->id_clinicMain,
            '77P',
        );
        if (!$validate)
            dieJson(458, 'WAU-0076');

        //:Retorna "os"
        $returnData['os'] = $osData;

        //:Busca dados do paciente
        $returnData['patient'] = $this->getPatient($osData->id_patient);

        //:Retorna "procedureList"
        $returnData['procedureList'] = $this->getProcedureList($osId);

        //:Retorna "stockList"
        $returnData['stockList'] = $this->getStockList($osId);

        //:Retorna "comissList"
        $returnData['comissList'] = $this->getComissList($osId);

        //:Retorna "partnerList"
        $returnData['partnerList'] = $this->getPartnerList($osId);

        //:Retorna "financialList"
        $returnData['financialList'] = $this->getFinancialList($osId);

        dieJson(200, $returnData);
    }

    //:RETORNA CADASTRO DE OS
    private function getOs($osId)
    {
        $resp =  $this->modOs
            ->select("
                os.id,
                os.id_clinic,
                os.id_clinicMain,
                os.id_prof,
                os.id_procedureMain,
                os.id_patient,
                os.id_status,
                os.id_login,
                os.notes,
                os.return,

                os.vl_procedureTable,
                os.vl_procedureDiscount,
                os.vl_procedureTax,
                os.vl_procedureTotal,
                os.vl_procedureMargin,
                os.pc_procedureDiscount,
                os.pc_procedureTax,
                os.tp_procedureDiscount,
                os.tp_procedureTax,

                os.vl_stockTable,
                os.vl_stockDiscount,
                os.vl_stockTotal,
                os.vl_stockTax,
                os.vl_stockCost,
                os.vl_stockMargin,
                os.pc_stockDiscount,
                os.pc_stockTax,
                os.tp_stockDiscount,
                os.tp_stockTax,

                os.vl_comissTotal,
                os.vl_partnerTotal,
                os.vl_invoiceTotal,
                os.updated_at AS optLock,
                SUBSTRING_INDEX(os.id_display, '-', 1) AS displayId,
                prof.name_social AS profName,
            ")
            ->join('user prof', 'prof.id = os.id_prof', 'left')
            ->where('os.id', $osId)
            ->first();

        if (empty($resp))
            dieJson(456, 'WAU-0080');

        return $resp;
    }

    //:RETORNA FETCH COM DADOS DO PACIENTE
    private function getPatient($patientId)
    {
        $resp = $this->modPatient
            ->select("
                patient.id,
                patient.id_clinic,
                patient.id_clinicMain,
                patient.name,
                patient.phone_number,
                patient.birthday,
                1               as checkIdOs,
                record.id       as checkIdRecord,
            ")
            ->join('record',            'record.id_patient = patient.id',                           'left')
            ->find($patientId);

        //:Se não encontrar paciente -> retorna erro
        if (empty($resp))
            dieJson(456, 'WAU-0081');

        $resp->age = $this->libDatePeriod->render($resp->birthday);

        return $resp;
    }

    //:RETORNA LISTA DE PROCEDIMENTOS
    private function getProcedureList($osId)
    {
        return $this->modOsProcedure
            ->select("
                os__procedure.id,
                os__procedure.id_procedure,
                os__procedure.external,
                os__procedure.qt,
                os__procedure.vl_sale,
                os__procedure.vl_total,
                procedure.name,
            ")
            ->join('procedure', 'procedure.id = os__procedure.id_procedure', 'left')
            ->where('id_os', $osId)
            ->orderBy('id', 'ASC')
            ->findAll();
    }

    //:RETORNA LISTA DE ESTOQUE
    private function getStockList($osId)
    {
        return $this->modOsStock
            ->select("
                os__stock.id,
                os__stock.id_stock,
                os__stock.external,
                os__stock.qt,
                os__stock.vl_purchase,
                os__stock.vl_sale,
                os__stock.vl_total,
                os__stock.status,
                stock.name,
                stock.qt_stock,
            ")
            ->join('stock', 'stock.id = os__stock.id_stock', 'left')
            ->where('id_os', $osId)
            ->orderBy('id', 'ASC')
            ->findAll();
    }

    //:RETORNA LISTA DE COMISSÕES
    private function getComissList($osId)
    {
        return $this->modOsComiss
            ->select("
                os__comiss.id,
                os__comiss.id_prof,
                os__comiss.id_type,
                os__comiss.value,
                os__comiss.percent,
                os__comiss.external,
                CONCAT_WS(' ', prof.name_prefix, prof.name_social) as profName,
            ")
            ->join('user prof', 'prof.id = os__comiss.id_prof', 'left')
            ->where('os__comiss.id_os', $osId)
            ->orderBy('os__comiss.id', 'ASC')
            ->findAll();
    }

    //:RETORNA LISTA DE PARTICIPAÇÕES
    private function getPartnerList($osId)
    {
        return $this->modOsPartner
            ->select("
                os__partner.id,
                os__partner.id_clinic,
                os__partner.id_type,
                os__partner.value,
                os__partner.percent,
                os__partner.external,
                clinic.name_social as clinicName,
            ")
            ->join('clinic', 'clinic.id = os__partner.id_clinic', 'left')
            ->where('os__partner.id_os', $osId)
            ->orderBy('os__partner.id', 'ASC')
            ->findAll();
    }

    //:RETORNA LISTA FINANCEIRA
    private function getFinancialList($osId)
    {
        $modFinLink = new FinLink_Model();
        $resp = $modFinLink
            ->select("
                fin__link.id,
                fc.text,
                fc.value,
            ")
            ->where('fin__link.id_targetName', 2) //:2 = OS
            ->where('fin__link.id_targetId', $osId)
            ->join('fin__content fc', 'fc.id = fin__link.id_content', 'left')
            ->orderBy('fin__link.id', 'ASC')
            ->findAll();

        return $resp;
    }

    //:SALVA TODOS OS DADOS VINDOS DE FETCH
    public function setData()
    {
        $optLock = parent::initFetch('98P', true);

        $osId = $this->request->getVar("osId");
        $data = $this->request->getVar('data');

        //:Busca dados da OS
        $osData = $this->getOs($osId);

        //:Valida Optimistic Lock
        if ($osData->optLock !== $optLock)
            dieJson(453);

        //:Verifica se OS pertence à clínica do login
        if ($osData->id_clinic != session('clinic')['id'])
            dieJson(457, 'WAU-0083');

        //:Atualiza "updated_at" da OS
        parent::optLockRefresh($this->modOs, $osId);

        //:Os
        if (!empty($data->os)) {
            $this->setOs($osId, $data->os);
        }

        //:Procedimento
        if (isset($data->procedure)) {
            foreach ($data->procedure as $procedureItem) {
                if (!empty($procedureItem->delete)) {
                    //:Deletar
                    $this->deleteProcedure($procedureItem);
                } else {
                    //:Criar ou Editar
                    $this->setProcedure($osId, $procedureItem);
                }
            }
        }

        //:Estoque
        if (isset($data->stock)) {
            foreach ($data->stock as $stockItem) {
                if (!empty($stockItem->delete)) {
                    //:Deletar
                    $this->deleteStock($stockItem);
                } else {
                    //:Criar ou Editar
                    $this->setStock($osId, $stockItem);
                }
            }
        }

        //:Comissão
        if (isset($data->comiss)) {
            foreach ($data->comiss as $comissItem) {
                if (!empty($comissItem->delete)) {
                    //:Deletar
                    $this->deleteComiss($comissItem);
                } else {
                    //:Criar ou Editar
                    $this->setComiss($osId, $comissItem);
                }
            }
        }

        //:Participação
        if (isset($data->partner)) {
            foreach ($data->partner as $partnerItem) {
                if (!empty($partnerItem->delete)) {
                    //:Deletar
                    $this->deletePartner($partnerItem);
                } else {
                    //:Criar ou Editar
                    $this->setPartner($osId, $partnerItem);
                }
            }
        }

        $patientId = $osData->id_patient;
        $models = (object) [
            'modPatient' => $this->modPatient,
            'modOs' => $this->modOs,
        ];
        OsSet_Model::set($patientId, $models);

        $this->getData($osId);
    }

    //:SALVA DADOS DA OS
    private function setOs(int $osId, object $dbInput)
    {
        $dbInput->id = $osId;

        $this->modOs->saveWau($dbInput);
    }

    //:SALVA DADOS DO PROCEDIMENTO
    private function setProcedure(int $osId, object $dbInput)
    {
        if ($dbInput->id === 'new') unset($dbInput->id);
        unset($dbInput->name);

        $dbInput->id_os = $osId;

        $this->modOsProcedure->protect(false)->save($dbInput);
    }

    //:SALVA DADOS DO ESTOQUE
    private function setStock(int $osId, object $dbInput)
    {
        if ($dbInput->id === 'new') unset($dbInput->id);
        unset($dbInput->name);

        $dbInput->id_os = $osId;

        $this->modOsStock->protect(false)->save($dbInput);
    }

    //:SALVA DADOS DA COMISSÃO
    private function setComiss($osId,  $dbInput)
    {
        if ($dbInput->id === 'new') unset($dbInput->id);
        unset($dbInput->profName);

        $dbInput->id_os = $osId;

        $this->modOsComiss->protect(false)->save($dbInput);
    }

    //:SALVA DADOS DA PARTICIPAÇÃO
    private function setPartner($osId,  $dbInput)
    {
        if ($dbInput->id === 'new') unset($dbInput->id);
        unset($dbInput->clinicName);

        $dbInput->id_os = $osId;

        $this->modOsPartner->protect(false)->save($dbInput);
    }

    //:DELERA DADOS DO PROCEDIMENTO
    private function deleteProcedure($dbInput)
    {
        $this->modOsProcedure->protect(false)->delete($dbInput->id);
    }

    //:DELERA DADOS DO ESTOQUE
    private function deleteStock($dbInput)
    {
        $this->modOsStock->protect(false)->delete($dbInput->id);
    }

    //:DELERA DADOS DA COMISSÃO
    private function deleteComiss($dbInput)
    {
        $this->modOsComiss->protect(false)->delete($dbInput->id);
    }

    //:DELERA DADOS DA PARTICIPAÇÃO
    private function deletePartner($dbInput)
    {
        $this->modOsPartner->protect(false)->delete($dbInput->id);
    }

    //:MOVIMENTA ITENS DE ESTOQUE
    public function moveStock()
    {
        $optLock = parent::initFetch('100P', true);

        $db = \Config\Database::connect();
        $db->transBegin();

        try {
            $osId = $this->request->getVar("osId");
            $dataList = $this->request->getVar('data')->list;
            $dataStatus = $this->request->getVar('data')->status;
            $action = $dataStatus == 1 ? 0 : 1;

            $osData = $this->getOs($osId);

            //:Valida Optimistic Lock
            if ($osData->optLock !== $optLock) {
                throw new \Exception('Os dados foram alterados por outro usuário.|Tela atualizada!');
            }

            if ($osData->id_clinic != session('clinic')['id']) {
                throw new \Exception('Clínica inválida');
            }

            //:Atualiza "updated_at" da OS
            parent::optLockRefresh($this->modOs, $osId);

            $modStock = new StockRegister_Model();

            $dbList = $this->modOsStock
                ->select('id, id_stock, qt')
                ->where('id_os', $osId)
                ->orderBy('id_stock', 'ASC')
                ->findAll();

            foreach ($dbList as $dbl) {
                if (!\in_array($dbl->id, $dataList)) {
                    continue;
                }

                //:Lock da linha
                $stock = $db->query(
                    'SELECT qt_stock FROM stock WHERE id = ? FOR UPDATE',
                    [$dbl->id_stock]
                )->getRow();

                $qtStock = (int) $stock->qt_stock;
                $qtOs = (int) $dbl->qt;

                $qtStockNew = $action
                    ? $qtStock - $qtOs
                    : $qtStock + $qtOs;

                if ($qtStockNew < 0) {
                    throw new \Exception('Estoque insuficiente');
                }

                //:Atualiza estoque
                $modStock->protect(false)->update(
                    $dbl->id_stock,
                    ['qt_stock' => $qtStockNew]
                );

                //:Atualiza status do item da OS
                $this->modOsStock->protect(false)->update(
                    $dbl->id,
                    ['status' => $action]
                );
            }

            $db->transCommit();
            $this->getData($osId);
        } catch (\Throwable $e) {
            $db->transRollback();
            $msg = $e->getMessage();
            dieJson(500, "TD:$msg");
        }
    }

    //:DELETA OS
    public function deleteOs($osId = null, $optLockActive = true)
    {
        $optLock = parent::initFetch(['123P', '128P'], $optLockActive === true);

        $osId ??= $this->request->getVar("osId");

        //:Busca dados da OS
        $osData = $this->getOs($osId);

        //:Valida Optimistic Lock
        if ($optLockActive === true && $osData->optLock !== $optLock)
            dieJson(453);

        //:Verifica se OS pertence à clínica do login
        if ($osData->id_clinic != session('clinic')['id'])
            dieJson(457, 'WAU-0139');

        //:Se os não pertence ao usuário logado
        if ($osData->id_login != session('log_userId')) {
            //:Se não tem permissão de deletar documentos de outros usuários
            if (!hasPermission('128P'))
                dieJson(468, 'WAU-0141');
        }

        //:Verifica se pode deletar OS
        $libCheckOsDelete = new CheckOsDelete();
        $checkOsDelete = $libCheckOsDelete->check($osId, $this->modOs);

        //:Itens de financeiro vinculados -> não pode deletar
        if ($checkOsDelete->finLinkId) {
            dieJson(468, 'TD:Existem lançamentos financeiros vinculados a este Serviço. Remova-os antes de deletar.');
        }

        //:Itens de estoque vinculados -> não pode deletar
        if ($checkOsDelete->osStockId) {
            dieJson(468, 'TD:Existem itens de estoque vinculados a este Serviço. Remova-os antes de deletar.');
        }

        //:Deleta procedimentos vinculados
        if ($checkOsDelete->osProcId) {
            $resp = $this->modOsProcedure
                ->where('id_os', $osId)
                ->delete();
        }

        //:Deleta comissões vinculadas
        if ($checkOsDelete->osComId) {
            $resp = $this->modOsComiss
                ->where('id_os', $osId)
                ->delete();
        }

        //:Deleta participações vinculadas
        if ($checkOsDelete->osPartnerId) {
            $resp = $this->modOsPartner
                ->where('id_os', $osId)
                ->delete();
        }

        //:Verifica se pode deletar OS (após validações)
        $checkOsDelete = $libCheckOsDelete->check($osId, $this->modOs);
        $hasRelations =
            $checkOsDelete->osProcId ||
            $checkOsDelete->osStockId ||
            $checkOsDelete->osComId ||
            $checkOsDelete->osPartnerId;
        if ($hasRelations)
            dieJson(468, 'TD:Não foi possível deletar este Serviço. Remova todos os vínculos antes de deletar.');

        //:Atualiza saldos do paciente
        $patientId = $osData->id_patient;
        $models = (object) [
            'modPatient' => $this->modPatient,
            'modOs' => $this->modOs,
        ];
        OsSet_Model::set($patientId, $models);

        //:Deleta OS
        $this->modOs
            ->where('id', $osId)
            ->delete();

        dieJson(200);
    }
}
