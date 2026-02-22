<?php

namespace App\Controllers\Patient\Libraries;

use App\Controllers\FetchController;
use App\Models\Patient\Register\PatientRegister_Model;
use App\Libraries\WhereMaker;

class Find_patient extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE PACIENTES
    public function find()
    {
        parent::initFetch('69P', false);

        $find = $this->request->getVar('find') ?? 'a';

        $modRegister = new PatientRegister_Model();
        $where = WhereMaker::get();

        $data['list'] = $modRegister
            ->select('id, name as col2, id_clinic')
            ->like('name', $find, 'after')
            ->where($where)
            ->orderBy('name')
            ->findAll(15);

        dieJson(200, $data);
    }
}
