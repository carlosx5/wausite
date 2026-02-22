<?php

namespace App\Controllers\Tools\Tools;

use App\Controllers\UnloggedController;

class Screen_size extends UnloggedController
{
    public function index()
    {
        $data = $this->dataCreate('', 'tools/tools/screen_size');

        return(viewShow('tools/tools/screen_size', $data, true, false));
    }
}
