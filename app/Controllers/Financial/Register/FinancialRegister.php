<?php

namespace App\Controllers\Financial\Register;

use App\Controllers\FetchController;
use App\Controllers\Patient\Libraries\PatientValidate;
use App\Models\Patient\Register\PatientRegister_Model;
use App\Models\Os\OsRegister_Model;
use App\Models\Financial\Content\FinContent_Model;
use App\Models\Financial\Link\FinLink_Model;

use App\Models\Financial\Libraries\PatientSet_Model;
use App\Models\Financial\Libraries\PatientDel_Model;

class FinancialRegister extends FetchController
{
    private $libValidate;
    public $modPatient;
    private $modOs;
    private $modFinContent;
    private $modFinLink;

    public function __construct()
    {
        $this->libValidate   = new PatientValidate();
        $this->modPatient    = new PatientRegister_Model();
        $this->modOs         = new OsRegister_Model();
        $this->modFinContent = new FinContent_Model();
        $this->modFinLink    = new FinLink_Model();
    }

    //:RETORNA REQUEST DE CADASTRO DO PACIENTE
    public function getData($patientId = null)
    {
        parent::initFetch('61P', false);

        $patientId ??= $this->request->getVar("patientId");
        $returnData = [];

        //:Busca "paciente"
        $patientData = $this->getPatient($patientId);

        //:Valida acesso ao paciente
        $validate = $this->libValidate->check(
            $patientData->id,
            $patientData->id_clinic,
            $patientData->id_clinicMain,
            '69P',
        );
        if (!$validate)
            dieJson(458, 'WAU-0155');

        //:Retorna "paciente"
        $returnData['patient'] = $patientData;

        //:Retorna "os"
        $returnData['osList'] = $this->getOsList($patientId);

        //:Retorna "financeiro"
        $returnData['financialList'] = $this->getFinancialList($patientId);

        dieJson(200, $returnData);
    }

    //:RETORNA CADASTRO DO PACIENTE 
    private function getPatient($patientId)
    {
        $resp =  $this->modPatient
            ->select("
                patient.id,
                patient.id_clinic,
                patient.id_clinicMain,
                patient.balance_os,
                patient.balance_paid,
                patient.balance_total,
                patient.name,
                patient.name_social as nameSocial,
                patient.updated_at  as optLock,
                os.id               as checkIdOs,
                record.id           as checkIdRecord,
            ")
            ->join('os',        'os.id_patient = patient.id',           'left')
            ->join('record',    'record.id_patient = patient.id',       'left')
            ->where('patient.id', $patientId)
            ->first();

        //:Se não encontrar paciente -> retorna erro
        if (empty($resp))
            dieJson(456, 'WAU-0154');

        return $resp;
    }

    //:RETORNA LISTA DE OS
    private function getOsList($patientId)
    {
        $resp =  $this->modOs
            ->select("
                os.id,
                os.created_at       as date,
                os.vl_invoiceTotal  as vlTotal,
                procedure.name      as procedureName,
                prof.name_social    as profName,
            ")
            ->where('os.id_patient', $patientId)
            ->join('procedure',     'procedure.id = os.id_procedureMain',   'left')
            ->join('user prof',     'prof.id = os.id_prof',                 'left')
            ->findAll();

        return $resp;
    }

    //:RETORNA LISTA DO FINANCEIRO
    private function getFinancialList($patientId)
    {
        $resp =  $this->modFinLink
            ->select("
                fin__link.sign,
                fin__link.id_targetId   as osId,
                fc.id                   as contentId,
                fc.date,
                fc.text,
                fc.value,
                fc.status,
                bank.name               as bankName,
                plan.name               as planName,
            ")
            ->where('fin__link.id_targetName', 1)
            ->where('fin__link.id_targetSecondary', $patientId)
            //:Busca "content"
            ->join('fin__content fc', 'fc.id = fin__link.id_content', 'left')
            //:Busca "bank"
            ->join('fin__link fl_bank', 'fl_bank.id_content = fc.id AND fl_bank.id_targetName = 15', 'left')
            ->join('bank', 'bank.id = fl_bank.id_targetId', 'left')
            //:Busca "plan"
            ->join('fin__link fl_plan', 'fl_plan.id_content = fc.id AND fl_plan.id_targetName = 20', 'left')
            ->join('plan', 'plan.id = fl_plan.id_targetId', 'left')
            ->orderBy('fc.date DESC, fc.id DESC')
            ->findAll();

        return $resp;
    }

    //:SALVA NOVO LANÇAMENTO EM BANCO
    public function setNewFinancial()
    {
        try {
            $optLock = parent::initFetch('62P', true);

            $osId = $this->request->getVar('osId');
            $patientId = $this->request->getVar('patientId');
            $dataFetch = $this->request->getVar('dataFetch');

            if (isset($dataFetch->objBankId)) {
                $dataFetch->idTargetId = $dataFetch->objBankId;
                $dataFetch->idTargetName = 15;
            }

            if (isset($dataFetch->objPlanId)) {
                $dataFetch->idTargetId = $dataFetch->objPlanId;
                $dataFetch->idTargetName = 20;
            }

            $models = (object) [
                'modOs' => $this->modOs,
                'modPatient' => $this->modPatient,
                'modFinContent' => $this->modFinContent,
                'modFinLink' => $this->modFinLink,
            ];

            PatientSet_Model::set($optLock, $osId, $patientId, $dataFetch, $models);
        } catch (\Exception $e) {
            dieJson(450, $e->getMessage());
        }

        $this->getData();
    }

    //:EXCLUI LANÇAMENTO EM BANCO
    public function deleteFinancial()
    {
        $optLock = parent::initFetch('9P', true);

        $contentId = $this->request->getVar('contentId');
        $patientId = $this->request->getVar('patientId');

        $models = (object) [
            'modPatient' => $this->modPatient,
            'modFinContent' => $this->modFinContent,
            'modFinLink' => $this->modFinLink,
        ];

        PatientDel_Model::del($optLock, $contentId, $patientId, $models);

        $this->getData();
    }
}
