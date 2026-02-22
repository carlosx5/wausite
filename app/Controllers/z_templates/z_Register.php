<?php

namespace App\Controllers\z_templates;

use App\Controllers\Patient\PatientMain;

class Z_Register extends PatientMain
{
    //:RETORNA REQUEST DE CADASTRO DO PACIENTE
    public function getData()
    {
        $sessionValues = $this->patientMain(54, true);
        $returnData = [];

        //:Retorna "register"
        $returnData['register'] = $this->getRegister($sessionValues->patientId);

        //:Retorna "localStorage"
        $returnData['localStorage'] = [
            'patientId' => $sessionValues->patientId,
            'patientName' => $sessionValues->patientName,
        ];

        dieJson(200, $returnData);
    }

    //:RETORNA CADASTRO DO PACIENTE
    private function getRegister($patientId)
    {
        if (empty($patientId))
            return null;

        $register = $this->modRegister
            ->select('
                patient.*,
                patient.id_ddi as phone_id,
                clinic.id as id_clinic,
                clinic.name_social as nm_clinic,
                plans.id as id_plan,
                plans.name_social as plan_name,
                ag.id as id_agent,
                ag.name_social as nm_agent,
                cy.ddi as phone_ddi,
                cy.img1 as phone_flag1,
                cy.img2 as phone_flag2,
            ')
            ->join('clinic', 'clinic.id = patient.id_clinic', 'left')
            ->join('plans', 'plans.id = patient.id_plan', 'left')
            ->join('user ag', 'ag.id = patient.id_agent', 'left')
            ->join('country cy', 'cy.id = patient.id_ddi', 'left')
            ->where('patient.id', $patientId)
            ->first();

        return $register;
    }

    //:SALVA DADOS DO PACIENTE
    public function setRegister()
    {
        $sessionValues = $this->patientMain(71);

        $dbInput = $this->request->getVar('data');
        $dbInput->id = $sessionValues->patientId;
        $returnData = [];

        //:Mudar campo "phone_id" p/ "id_ddi"
        if (isset($dbInput->phone_id)) {
            $dbInput->id_ddi = $dbInput->phone_id;
            unset($dbInput->phone_id);
        }

        //:Trabalha data de nascimento
        if (!empty($dbInput->birthday)) {
            $dbInput->birthday = date('Y-m-d', strtotime(str_replace("/", "-", $dbInput->birthday)));
        } elseif (isset($dbInput->birthday)) {
            $dbInput->birthday = null;
        }

        //:Trabalha valor do plano
        if (isset($dbInput->plan_value))
            $dbInput->plan_value = str_replace(['.', ','], ['', '.'], $dbInput->plan_value);

        //:Salva
        $respSave = $this->modRegister->saveWau($dbInput);

        //:Retorna "respSave"
        $returnData['respSave'] = $respSave;

        //:Retorna "register"
        $returnData['register'] = $this->getRegister($sessionValues->patientId);

        //:Retorna "localStorage"
        $returnData['localStorage'] = [
            'patientId' => $sessionValues->patientId,
            'patientName' => $sessionValues->patientName,
        ];

        dieJson(200, $returnData);
    }
}
