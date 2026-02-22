<?php

namespace App\Controllers\Clinic;

use App\Controllers\ViewController;

class ClinicMain extends ViewController
{
    //:INDEX
    public function index(): void
    {
        $this->initBackend(54);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Clínicas',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            "p-cropper.v162,clinic/clinicMain",
            "p-cropper.v162,clinic/clinicMain",
            'clinic'
        );

        $data['varJS']['callback'] = 'clinicImage/setData';

        viewShow('clinic/clinicMain', $data);
    }
}
