<?php

namespace App\Controllers\Config;

use App\Controllers\ViewController;

class ConfigMain extends ViewController
{
    //:INDEX
    public function index(): void
    {
        $this->initBackend(69);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Configurações',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            'config/configMain',
            'config/configMain',
            'config'
        );

        viewShow('config/configMain', $data);
    }
}
