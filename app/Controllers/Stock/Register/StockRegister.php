<?php

namespace App\Controllers\Stock\Register;

use App\Controllers\Stock\StockMain;

class StockRegister extends StockMain
{
    //:RETORNA REQUEST DE CADASTRO DE ESTOQUE
    public function getData($stockId = null)
    {
        $stockId ??= $this->request->getVar("stockId");
        $sessionValues = $this->stockMain(10, $stockId,  true);
        $returnData = [];

        //:Retorna "register"
        $returnData['register'] = $this->getRegister($sessionValues->stockId);

        //:Retorna "localStorage"
        $returnData['localStorage'] = [
            'stockId'   => $sessionValues->stockId,
            'stockName' => $sessionValues->stockName,
        ];

        dieJson(200, $returnData);
    }

    //:RETORNA CADASTRO DO ESTOQUE
    public function getRegister($stockId)
    {
        return $this->modRegister
            ->select("
                stock.id,
                stock.id_category,
                stock.id_display,
                stock.name,
                stock.qt_stock,
                stock.qt_minStock,
                stock.qt_maxStock,
                stock.vl_sale,
                stock.vl_purchase,
                stock.measurementUnit,
                stock.expiryDate,
                stock.obs,
                sc.name as nm_category
            ")
            ->join('stock_category sc', 'sc.id = stock.id_category', 'LEFT')
            ->find($stockId);
    }

    //:SALVA DADOS DO ESTOQUE
    public function setRegister()
    {
        $stockId = $this->request->getVar('stockId');
        $dbInput = $this->request->getVar('data')->register;

        $this->stockMain(11, $stockId);

        if ($stockId === 'new' && $dbInput->id !== 'new')
            dieJson(455);

        //:Salvar
        unset($dbInput->id_clinic);
        if ($stockId === 'new')
            $dbInput->id_clinic = session('clinic')['id'];
        ///
        $stockId = $this->modRegister->saveWau($dbInput);

        $this->getData($stockId);
    }
}
