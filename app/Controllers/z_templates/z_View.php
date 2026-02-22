<?php

namespace App\Controllers\z_templates;

use App\Controllers\ViewController;

class Z_View extends ViewController
{
    //:INDEX
    public function index()
    {
        $this->initBackend(58);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Bancos',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            "bank/bankMain",
            "bank/bankMain",
            'bank'
        );

        viewShow('bank/bankMain', $data);
    }
}
