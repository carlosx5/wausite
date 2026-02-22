<?php

namespace App\Controllers\Tools\Tools;

use App\Controllers\FetchController;

class SystemMaintenance extends FetchController
{
    //:ATIVA E DESATIVA TODOS OS USUÁRIOS DO SISTEMA
    public function run()
    {
        $this->initFetch('9P');

        $systemMaintenance = cache()->get('systemMaintenance');

        if ($systemMaintenance) {
            cache()->delete('systemMaintenance');
        } else {
            cache()->save('systemMaintenance', 1, 86400);
        }

        $resp = cache()->get('systemMaintenance');

        dieJson(200, $resp);
    }
}
