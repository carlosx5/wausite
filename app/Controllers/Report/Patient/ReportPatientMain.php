<?php

namespace App\Controllers\Report\Patient;

use App\Controllers\ViewController;

class ReportPatientMain extends ViewController
{
    public function index(): void
    {
        $this->initBackend('120P');

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Relatórios',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            'report/patient/reportPatientMain',
            'report/patient/reportPatientMain',
            'rel_patient'
        );

        viewShow('report/patient/reportPatientMain', $data);
    }
}
