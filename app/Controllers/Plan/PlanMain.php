<?php

namespace App\Controllers\Plan;

use App\Controllers\ViewController;

class PlanMain extends ViewController
{
    //:INDEX
    public function index(): void
    {
        $this->initBackend('72P');

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Convênios',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            "plan/planMain",
            "plan/planMain",
            "plan"
        );

        viewShow('plan/planMain', $data);
    }
}
