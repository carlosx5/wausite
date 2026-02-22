<?php

namespace App\Controllers\Stock\Purchasing;

use App\Controllers\BaseController;
use App\Models\Stock\Register\Register_Model;

class Purchasing extends BaseController
{
    public function __construct()
    {
        $this->modStock = new Register_Model();
    }

    /**
     * Método de tela
     */
    public function index()
    {
        $this->initBackend(10);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Estoque',
            'viewTitle' => 'Cadastro de Compras',
            'contenList' => [],
        ]);

        $uri = uri_string();
        $data = $this->dataCreate($uri, $uri, 'purchasing');

        return(viewShow($uri, $data));
    }
}
