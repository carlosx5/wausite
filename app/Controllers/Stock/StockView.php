<?php

namespace App\Controllers\Stock;

use App\Controllers\ViewController;

class StockView extends ViewController
{
    //:INDEX
    public function index()
    {
        $this->initBackend(54);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Estoque',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            "stock/stockMain",
            "stock/stockMain",
            'stock'
        );

        viewShow('stock/stockMain', $data);
    }
}
