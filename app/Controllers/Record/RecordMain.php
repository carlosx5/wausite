<?php

namespace App\Controllers\Record;

use App\Controllers\ViewController;

class RecordMain extends ViewController
{
    //:INDEX
    public function index()
    {
        $this->initBackend(142);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Pacientes',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            'p-quillEditor,record/recordMain',
            'p-quillEditor,record/recordMain',
            'record'
        );

        $data['varJS']['video'] = [
            'list' => '',
            'register' => '',
        ];

        viewShow('record/recordMain', $data);
    }
}
