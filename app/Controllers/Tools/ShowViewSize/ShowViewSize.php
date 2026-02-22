<?php

namespace App\Controllers\Tools\ShowViewSize;

use App\Controllers\UnloggedController;

class ShowViewSize extends UnloggedController
{
    public function index()
    {
        echo view('tools/showViewSize/showViewSize.html');
    }
}
