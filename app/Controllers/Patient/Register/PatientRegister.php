<?php

namespace App\Controllers\Patient\Register;

use App\Controllers\FetchController;
use App\Controllers\Patient\Libraries\PatientValidate;
use App\Models\Patient\Register\PatientRegister_Model;

class PatientRegister extends FetchController
{
    private $libValidate;
    private $modPatient;

    public function __construct()
    {
        $this->libValidate = new PatientValidate();
        $this->modPatient = new PatientRegister_Model();
    }

    //:RETORNA REQUEST DE CADASTRO DO PACIENTE
    public function getData($patientId = null)
    {
        parent::initFetch('69P', false);

        $patientId ??= $this->request->getVar("patientId");
        $returnData = [];

        //:Busca "paciente"
        $patientData = $this->getPatient($patientId);

        //:Valida acesso ao paciente
        $validate = $this->libValidate->check(
            $patientData->id,
            $patientData->id_clinic,
            $patientData->id_clinicMain,
            69,
        );
        if (!$validate)
            dieJson(458, 'WAU-0060');

        //:Retorna "paciente"
        $returnData['patient'] = $patientData;

        dieJson(200, $returnData);
    }

    //:RETORNA CADASTRO DO PACIENTE
    private function getPatient($patientId)
    {
        $resp =  $this->modPatient
            ->select("
                patient.*,
                patient.updated_at  as optLock,
                clinic.id           as id_clinic,
                clinic.name_social  as nm_clinic,
                os.id               as checkIdOs,
                record.id           as checkIdRecord,
            ")
            ->join('os',        'os.id_patient = patient.id',       'left')
            ->join('record',    'record.id_patient = patient.id',   'left')
            ->join('clinic',    'clinic.id = patient.id_clinic',    'left')
            ->where('patient.id', $patientId)
            ->first();

        //:Se não encontrar paciente -> retorna erro
        if (empty($resp))
            dieJson(456, 'WAU-0059');

        return $resp;
    }

    //:SALVA TODOS OS DADOS VINDOS DE FETCH
    public function setData()
    {
        $optLock = parent::initFetch(['69P', '71P', '95P', '96P'], true);

        $dbInput = $this->request->getVar('data');
        $patientId = $dbInput->patient->id;

        //:Registro
        if (!empty($dbInput->patient)) {
            $patientId = $this->setPatient($patientId, $dbInput->patient, $optLock);
        }

        $this->getData($patientId);
    }

    //:SALVA DADOS DO PACIENTE
    private function setPatient($patientId, $dbInput, $optLock)
    {
        if ($patientId === 'new' && $dbInput->id !== 'new')
            dieJson(455);

        //:Valida acesso ao paciente existente
        if ((int) $patientId > 0) {
            //:Busca "paciente" e verifica se existe
            $patientData =  $this->modPatient->select("id, id_clinic, id_clinicMain")->find($patientId);
            if (empty($patientData))
                dieJson(458, 'WAU-0094');

            //:Valida acesso ao paciente
            $validate = $this->libValidate->check(
                $patientData->id,
                $patientData->id_clinic,
                $patientData->id_clinicMain,
                999,
            );
            if (!$validate)
                dieJson(458, 'WAU-0093');
        }

        unset(
            $dbInput->id_clinic,
            $dbInput->id_display,
            $dbInput->nm_clinic
        );

        //:Ajusta valores
        if (isset($dbInput->plan_value))
            //:Ajusta valor do plano de saúde
            $dbInput->plan_value = str_replace(['.', ','], ['', '.'], $dbInput->plan_value);

        //:Salva paciente
        $patientId = $this->modPatient->saveWau($dbInput, $optLock);

        return $patientId;
    }

    public function checkCpf()
    {
        parent::initFetch('69P', false);

        $cpf = $this->request->getVar('cpf');
        $clinicId = session('clinic')['id'];

        $returnData['patient'] =  $this->modPatient
            ->select("
                patient.id,
                patient.name,
            ")
            ->where('id_clinic', $clinicId)
            ->where('patient.cpf', $cpf)
            ->first();

        dieJson(200, $returnData);
    }
}
