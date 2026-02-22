<?php

namespace App\Controllers\Login\Debugger;

use App\Controllers\ViewController;

class DebuggerMain extends ViewController
{
    public function index()
    {
        $this->initBackend(9);
        session()->setFlashdata('sidebar', []);

        $data = $this->dataCreate(
            'login/debugger/debuggerMain',
            'login/debugger/debuggerMain',
            'debugger'
        );

        viewShow('login/debugger/debuggerMain', $data);
    }
}
