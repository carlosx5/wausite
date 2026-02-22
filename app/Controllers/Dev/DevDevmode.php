<?php

namespace App\Controllers\Dev;

use App\Controllers\FetchController;

class DevDevmode extends FetchController
{
    public function runDevmode()
    {
        //:Se for debugger, libera tudo
        $permis = session()->debugger == 1 ? '999P' : '9P';
        parent::initFetch($permis, false);

        if (cache()->get('devmodeOn')) {
            cache()->delete('devmodeOn');
        } else {
            // cache()->save('devmodeOn', 1, 86400);
            cache()->save('devmodeOn', 1, 604800);
        }

        $resp = cache()->get('devmodeOn');

        dieJson(200, $resp);
    }
}
