<?php

namespace App\Controllers\Procedure;

use App\Controllers\ViewController;

class ProcedureMain extends ViewController
{
    public function index()
    {
        $this->initBackend('163P');

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Procedimentos',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            "procedure/procedureMain",
            "procedure/procedureMain",
            'procedure'
        );

        viewShow('procedure/procedureMain', $data);
    }
}
