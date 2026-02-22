<?php

namespace App\Controllers\Os\List;

use App\Controllers\FetchController;
use App\Controllers\Patient\Libraries\PatientValidate;
use App\Models\Os\OsRegister_Model;
use App\Models\Patient\Register\PatientRegister_Model;

class OsList extends FetchController
{
    private $libValidate;
    private $modOs;
    private $modPatient;

    public function __construct()
    {
        $this->libValidate = new PatientValidate();
        $this->modOs = new OsRegister_Model();
        $this->modPatient = new PatientRegister_Model();
    }

    //:RETORNA FETCH COM LISTA DE OS
    public function getData()
    {
        parent::initFetch('76P', false);

        $patientId = $this->request->getVar('patientId');
        $returnData = [];

        //:Busca "paciente"
        $patientData = $this->getPatient($patientId);

        //:Valida acesso ao paciente
        $validate = $this->libValidate->check(
            $patientData->id,
            $patientData->id_clinic,
            $patientData->id_clinicMain,
            76,
        );
        if (!$validate)
            dieJson(458, 'WAU-0058');

        //:Retorna lista de prontuários
        $returnData['osList'] = $this->getOsList($patientData->id);

        //:Retorna dados do paciente
        $returnData['patient'] = $this->getPatient($patientId);

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
            dieJson(456, 'WAU-0057');

        return $resp;
    }

    private function getOsList($patientId)
    {
        $resp = $this->modOs
            ->select("
                os.*,
                prof.name_social as profName,
                procedure.name as procedureName
            ")
            ->where('id_patient', $patientId)
            ->join('user prof', 'prof.id = os.id_prof', 'left')
            ->join('procedure', 'procedure.id = os.id_procedureMain', 'left')
            ->findAll(15);

        return $resp;
    }
}
