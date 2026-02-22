<?php

namespace App\Controllers\Patient\Statement;

use App\Controllers\Patient\PatientMain;
use App\Models\Patient\Statement\PatientStatement_Model;


class PatientStatement extends PatientMain
{
    private $modPatientStatement;

    public function __construct()
    {
        parent::__construct();
        $this->modPatientStatement = new PatientStatement_Model();
    }

    //:RETORNA REQUEST DE FINANCEIRO DO PACIENTE
    public function getData()
    {
        $sessionValues = $this->patientMain(104, true);
        $returnData = [];

        //:Retorna lista de extrato do paciente
        $returnData['list'] = $this->getList($sessionValues->id);

        //:Retorna localStorage
        $returnData['localStorage'] = [
            'patientId' => $sessionValues->id,
            'patientName' => $sessionValues->patientName,
        ];

        dieJson(200, $returnData);
    }

    //:RETORNA LISTA DE EXTRATO DO PACIENTE
    private function getList($patientId)
    {
        if (empty($patientId))
            return [];

        $resp = $this->modPatientStatement
            ->select("
                bkpa.*,
                FORMAT(bkpa.value, 2, 'de_DE') as value,
                DATE_FORMAT(bank.date, '%d/%m/%Y') as date,
                bank.available,
                bank.description
            ")
            ->join('bank', 'bank.id = bkpa.id_bank', 'left')
            ->where('bkpa.id_patient', $patientId)
            ->findAll();

        return $resp;
    }
}
