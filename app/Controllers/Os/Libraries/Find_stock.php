<?php

namespace App\Controllers\Os\Libraries;

use App\Controllers\FetchController;
use App\Models\Stock\Register\StockRegister_Model;

class Find_stock extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE ESTOQUE
    public function find()
    {
        parent::initFetch('98P', false);

        $find = $this->request->getVar('find') ?? 'a';
        $clinicId = session('clinic')['id'];

        $modRegister = new StockRegister_Model();

        $data['list'] = $modRegister
            ->select('id, name, qt_stock, vl_purchase, vl_sale')
            ->like('name', $find, 'after')
            ->where('id_clinic', $clinicId)
            ->orderBy('name')
            ->findAll(15);

        dieJson(200, $data);
    }
}
