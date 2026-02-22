<?php

namespace App\Controllers\Provider;

use App\Controllers\ViewController;

class ProviderView extends ViewController
{
    //:INDEX
    public function index()
    {
        $this->initBackend(54);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Fornecedores',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            "provider/providerMain",
            "provider/providerMain",
            'provider'
        );

        viewShow('provider/providerMain', $data);
    }
}
