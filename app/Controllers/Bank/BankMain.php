<?php

namespace App\Controllers\Bank;

use App\Controllers\ViewController;

class BankMain extends ViewController
{
    //:INDEX
    public function index(): void
    {
        $this->initBackend('58P');

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Bancos',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            "bank/bankMain",
            "bank/bankMain",
            "bank"
        );

        viewShow('bank/bankMain', $data);
    }
}
