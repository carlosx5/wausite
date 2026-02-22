<?php

declare(strict_types=1);

namespace App\Controllers\Os;

use App\Controllers\ViewController;


class OsMain extends ViewController
{
    //:INDEX
    public function index()
    {
        $this->initBackend('76P');

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Pacientes',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            "os/osMain",
            "os/osMain",
            'os'
        );

        $data['varJS']['video'] = [
            'list' => 'e023743a-37a1-44b2-9df3-7fb06100230b',
        ];

        viewShow('os/osMain', $data);
    }
}
