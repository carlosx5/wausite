<?php

namespace App\Controllers\Record\List;

use App\Controllers\FetchController;
use App\Controllers\Patient\Libraries\PatientValidate;
use App\Models\Record\Register\RecordRegister_Model;
use App\Models\Record\Module\RecordModule_Model;
use App\Models\Patient\Register\PatientRegister_Model;

class RecordList extends FetchController
{
    private $libValidate;
    private $modRecord;
    private $modPatient;


    public function __construct()
    {
        $this->libValidate = new PatientValidate();
        $this->modRecord = new RecordRegister_Model();
        $this->modPatient = new PatientRegister_Model();
    }

    //:RETORNA FETCH COM LISTA DE PRONTUÁRIOS
    public function getData()
    {
        parent::initFetch('142P', false);

        $patientId = $this->request->getVar('patientId');
        $returnData = [];

        //:Busca "paciente"
        $patientData = $this->getPatient($patientId);

        //:Valida acesso ao paciente
        $validate = $this->libValidate->check(
            $patientData->id,
            $patientData->id_clinic,
            $patientData->id_clinicMain,
            142,
        );
        if (!$validate)
            dieJson(458, 'WAU-0064');

        //:Retorna lista de prontuários
        $returnData['list'] = $this->getRecordList($patientData->id);

        //:Retorna dados do paciente
        $returnData['patient'] = $patientData;

        dieJson(200, $returnData);
    }

    //:RETORNA DADOS DO PACIENTE
    private function getPatient($patientId)
    {
        $resp = $this->modPatient
            ->select("
                patient.id,
                patient.id_clinic,
                patient.id_clinicMain,
                patient.name,
                1           as checkIdOs,
                record.id   as checkIdRecord,
            ")
            ->join('record',            'record.id_patient = patient.id',                           'left')
            ->find($patientId);

        //:Se não encontrar paciente -> retorna erro
        if (empty($resp))
            dieJson(456, 'WAU-0063');

        return $resp;
    }

    //:RETORNA LISTA DE PRONTUÁRIOS
    private function getRecordList($patientId)
    {
        $resp = $this->modRecord
            ->select("
                record.id,
                record.id_pending,
                record.id_autentique,
                record.signature_status,
                record.created_at,
                record.start,
                record.end,
                record.modulesOrder,
                record.hiddenModules,
                prof.name_social as profName,
                procedure.name as procedureName
            ")
            ->where('id_patient', $patientId)
            ->join('user prof', 'prof.id = record.id_prof', 'left')
            ->join('procedure', 'procedure.id = record.id_procedure', 'left')
            ->findAll(15);

        //:Lista não existe
        if (!$resp)
            dieJson(456, 'WAU-0065');

        return $resp;
    }

    //:RETORNA DADOS DOS MÓDULO PDF
    public function getModulePdf()
    {
        $recordId = $this->request->getVar('recordId');

        $modModule = new RecordModule_Model();
        $returnData['modulePdf'] = $modModule
            ->select("
                record__module.id,
                record__module.content as content,
            ")
            ->where('id_record', $recordId)
            ->where('id_file_type', 20)
            ->first();

        dieJson(200, $returnData);
    }
}
