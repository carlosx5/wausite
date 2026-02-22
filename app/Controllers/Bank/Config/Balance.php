<?php

namespace App\Controllers\Bank\Config;

use App\Controllers\BaseController;
use App\Models\Bank\Config\Balance_Model;

class Balance extends BaseController
{
    private $modBankBalance;

    public function __construct()
    {
        $this->modBankBalance = new Balance_Model();
    }

    /** //-TELA */
    public function index()
    {
        $this->initBackend(9);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Financeiro',
            'viewTitle' => 'Empréstimo',
            'contenList' => ['bank/loan/sidebar'],
        ]);

        $uri = uri_string();
        $data = $this->dataCreate(
            $uri,
            $uri,
            'bank_balance'
        );

        return viewShow($uri, $data);
    }

    /** //+BUSCA DADOS */
    public function getData()
    {
        $this->initFetch(9);

        $tableList = [10, 11];

        $data['list'] = $this->modBankBalance->getList($tableList);

        return $this->json(200, $data);
    }

    /** //+ATUALIZA DADOS */
    public function refresh()
    {
        $this->initFetch(9);

        $data = $this->request->getVar();

        $this->modBankBalance->refresh($data);

        $this->getData();
    }
}
