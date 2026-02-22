<?php

namespace App\Controllers\Dev;

use App\Controllers\FetchController;

class DevRefresh extends FetchController
{
    public function run()
    {
        //:Se for debugger, libera tudo
        $permis = session()->debugger == 1 ? '999P' : '9P';
        parent::initFetch($permis, false);

        cache()->delete('refresh');

        $resp = cache()->get('refresh');

        dieJson(200, $resp);
    }
}
