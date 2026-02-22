<?php

namespace App\Controllers\Patient;

use App\Controllers\ViewController;

class PatientMain extends ViewController
{
    public function index(): void
    {
        $this->initBackend(69);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Pacientes',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            'patient/patientMain',
            'patient/patientMain',
            'patient'
        );

        $data['varJS']['video'] = [
            'register' => 'd2d6f43e-6218-4b82-8514-4754e23760ac',
        ];

        viewShow('patient/patientMain', $data);
    }
}
