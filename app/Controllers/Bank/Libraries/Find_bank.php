<?php

namespace App\Controllers\Bank\Libraries;

use App\Controllers\FetchController;
use App\Models\Bank\Register\BankRegister_Model;

class Find_bank extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE PACIENTES
    public function find()
    {
        parent::initFetch('999P', false);

        $find = $this->request->getVar('find');
        $where = [];

        $where['id_clinic'] = session('clinic')['id'];

        $modBank = new BankRegister_Model();

        $data['list'] = $modBank
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
