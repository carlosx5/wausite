<?php

namespace App\Controllers\Tools\Modelos_bootstrap;

use App\Controllers\BaseController;

class Modelos extends BaseController
{
    public function radios(): void
    {
        echo view("tools/modelos_bootstrap/radios.html");
    }

    public function check(): void
    {
        echo view("tools/modelos_bootstrap/check.html");
    }
}
