<?php

namespace App\Controllers\Stock;

use App\Controllers\FetchController;
use App\Models\Stock\Register\StockRegister_Model;

class StockFind extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE PACIENTES
    public function find()
    {
        parent::initFetch('70P', false);

        $find = $this->request->getVar('find') ?? 'a';
        $clinicId = session('clinic')['id'];

        $modRegister = new StockRegister_Model();

        $data['list'] = $modRegister
            ->select('id, name as col2, id_clinic')
            ->like('name', $find, 'after')
            ->where('id_clinic', $clinicId)
            ->orderBy('name')
            ->findAll(15);

        dieJson(200, $data);
    }
}
