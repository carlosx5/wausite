<?php

namespace App\Controllers\Stock\List;

use App\Controllers\FetchController;
use App\Models\Stock\Register\StockRegister_Model;

class StockList extends FetchController
{
    public function getDataList()
    {
        //:Checagem invalida -> retorna 468 (sem permissão)
        if (!parent::initFetch('10P', false))
            dieJson(468);

        $modRegister = new StockRegister_Model();
        $clinicId = session('clinic')['id'];

        $returnData['list'] = $modRegister
            ->select("
                stock.id,
                SUBSTRING_INDEX(stock.id_display, '-', 1) AS displayId,
                stock.name,
                stock.qt_stock,
                stock.qt_minStock,
                stock.qt_maxStock,
                stock.vl_sale,
                stock.vl_purchase,
            ")
            ->where('stock.id_clinic', $clinicId)
            ->findAll();

        dieJson(200, $returnData);
    }
}
