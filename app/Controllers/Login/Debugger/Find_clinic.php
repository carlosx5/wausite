<?php

namespace App\Controllers\Login\Debugger;

use App\Controllers\FetchController;
use App\Models\Clinic\ClinicRegister_Model;

class Find_clinic extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE CLINICAS
    public function find()
    {
        parent::initFetch('9P', false);

        $find = $this->request->getVar('find');

        $modRegister = new ClinicRegister_Model();

        $data['list'] = $modRegister
            ->select('id, name_social as col2')
            ->like('name_social', $find, 'left')
            ->orderBy('name_social')
            ->findAll(15);

        dieJson(200, $data);
    }
}
