<?php

namespace App\Controllers\Report\Libraries;

use App\Controllers\FetchController;
use App\Models\Bank\Register\BankRegister_Model;

class Find_bank extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE BANCOS
    public function find()
    {
        parent::initFetch('169P', false);

        $find = $this->request->getVar('find');
        $clinicId = session('clinic')['id'];
        $returnData = [];

        $modBank = new BankRegister_Model();

        //:Cria $where
        $where = "id_clinic = $clinicId";

        $returnData['list'] = $modBank
            ->select('
                id,
                name,
            ')
            ->like('name', $find, 'after')
            ->where($where)
            ->orderBy('name')
            ->findAll(15);

        dieJson(200, $returnData);
    }
}
