<?php

namespace App\Controllers\User\Libraries;

use App\Controllers\FetchController;
use App\Models\User\UserActivity_Model;

class Find_activity extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE ATIVIDADES
    public function find()
    {
        parent::initFetch('9P', false);

        $find = $this->request->getVar('find');


        $modRegister = new UserActivity_Model();

        $data['list'] = $modRegister
            ->select('
                id,
                name as col2,
            ')
            ->like('name', $find, 'after')
            ->orderBy('name')
            ->findAll(15);

        dieJson(200, $data);
    }
}
