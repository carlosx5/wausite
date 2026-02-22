<?php

namespace App\Controllers\Financial;

use App\Controllers\ViewController;

class FinancialMain extends ViewController
{
    public function index(): void
    {
        $this->initBackend(69);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Pacientes',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            'financial/financialMain',
            'financial/financialMain',
            'financial'
        );

        viewShow('financial/financialMain', $data);
    }
}
