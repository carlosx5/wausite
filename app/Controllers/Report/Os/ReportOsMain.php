<?php

namespace App\Controllers\Report\Os;

use App\Controllers\ViewController;

class ReportOsMain extends ViewController
{
    public function index(): void
    {
        $this->initBackend('120P');

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Relatórios',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            'report/os/reportOsMain',
            'report/os/reportOsMain',
            'rel_os'
        );

        viewShow('report/os/reportOsMain', $data);
    }
}
