<?php

namespace App\Controllers\Report\Service;

use App\Controllers\ViewController;

class ReportServiceMain extends ViewController
{
    public function index(): void
    {
        $this->initBackend('170P');

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Relatórios',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            'report/service/reportServiceMain',
            'report/service/reportServiceMain',
            'rel_service'
        );

        viewShow('report/service/reportServiceMain', $data);
    }
}
