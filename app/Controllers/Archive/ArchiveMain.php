<?php

namespace App\Controllers\Archive;

use App\Controllers\ViewController;

class ArchiveMain extends ViewController
{
    public function index()
    {
        $this->initBackend(['159P', '102P', '107P']);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Pacientes',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            'archive/archiveMain',
            'archive/archiveMain',
            'archive'
        );

        $data['varJS']['video'] = [
            'archive' => '3f6da069-28c7-431a-ab65-df40ca03c9f2',
        ];

        viewShow('archive/archiveMain', $data);
    }
}
