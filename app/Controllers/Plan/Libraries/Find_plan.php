<?php

namespace App\Controllers\Plan\Libraries;

use App\Controllers\FetchController;
use App\Models\Plan\PlanRegister_Model;

class Find_plan extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE PLANOS
    public function find()
    {
        parent::initFetch('999P', false);

        $find = $this->request->getVar('find');
        $where = [];

        $where['id_clinic'] = session('clinic')['id'];

        $modPlan = new PlanRegister_Model();

        $data['list'] = $modPlan
            ->select("
                id,
                name,
            ")
            ->like('name', $find, 'after')
            ->where($where)
            ->orderBy('name')
            ->findAll(15);

        dieJson(200, $data);
    }
}
