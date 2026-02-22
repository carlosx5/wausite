<?php

namespace App\Controllers\Report\Bank;

use App\Controllers\ViewController;

class ReportBankMain extends ViewController
{
    public function index(): void
    {
        $this->initBackend('169P');

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Relatórios',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            'report/bank/reportBankMain',
            'report/bank/reportBankMain',
            'rel_bank'
        );

        viewShow('report/bank/reportBankMain', $data);
    }
}
