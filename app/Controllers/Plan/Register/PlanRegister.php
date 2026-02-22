<?php

namespace App\Controllers\Plan\Register;

use App\Controllers\FetchController;
use App\Models\Plan\PlanRegister_Model;

class PlanRegister extends FetchController
{
    private $modPlan;

    public function __construct()
    {
        $this->modPlan = new PlanRegister_Model();
    }

    //:RETORNA DADOS P/ TELA DE PLANO
    public function getData($planId = null)
    {
        parent::initFetch('72P', false);

        $planId ??= $this->request->getVar("planId");
        $returnData = [];

        //:Busca "plano"
        $planData = $this->getPlan($planId);

        //:Retorna "plano"
        $returnData['plan'] = $planData;

        //:Retorna "lista de planos"
        $returnData['planList'] = $this->getPlanList();

        dieJson(200, $returnData);
    }

    //:RETORNA CADASTRO DO PLANO
    private function getPlan($planId)
    {
        if (empty($planId))
            return null;

        $resp = $this->modPlan
            ->select('
                plan.id,
                plan.id_clinic,
                plan.name,
                cl.name_social      as clinicName,
            ')
            ->join('clinic cl', 'cl.id = plan.id_clinic', 'left')
            ->where('plan.id', $planId)
            ->first();

        return $resp;
    }

    //:RETORNA LISTA DE PLANOS
    private function getPlanList()
    {
        $clinicId = session('clinic')['id'];

        $resp = $this->modPlan
            ->select('
                id,
                name,
            ')
            ->where('id_clinic', $clinicId)
            ->findAll();

        return $resp;
    }

    //:SALVA DADOS DO PLANO
    public function setPlan()
    {
        parent::initFetch('73P', false);

        $dbInput = $this->request->getVar('data')->plan;
        $planId = $dbInput->id;

        if ((int) $planId > 0) { //.Update
            //:Busca "plano"
            $planData = $this->getPlan($planId);

            //:Valida clínica do plano
            if ($planData->id_clinic !== session('clinic')['id'])
                dieJson(453, 'WAU-0176');

            //:Remove campos não editáveis
            unset($planData->id_clinic);

            $resp = $this->modPlan->protect(false)->update($planId, $dbInput);
        } else { //.Insert
            $dbInput->id_clinic = session('clinic')['id'];
            $resp = $this->modPlan->protect(false)->insert($dbInput);
            $planId = $resp;
        }

        $this->getData($planId);
    }
}
