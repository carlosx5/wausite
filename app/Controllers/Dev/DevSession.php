<?php

namespace App\Controllers\Dev;

use App\Controllers\BaseController;

class DevSession extends BaseController
{
    public function get()
    {
        $data['template'] = view("dev/sessionModal.html");
        // $data['session'] = session()->get();

        //:Nativo do CI4
        $lastRegenerate = $_SESSION['__ci_last_regenerate'] ?? 'N/A';
        $expiration = config('Session')->expiration;

        //:Calcula tempo restante baseado na regeneração
        $timeLeft = ($lastRegenerate + $expiration) - time();

        $data['session'] = [
            'last_regenerate' => $lastRegenerate,
            'expiration_config' => $expiration,
            'time_left' => $timeLeft,
            'server_time' => time(),
            'session_dump' => $_SESSION // Cuidado: pode conter dados sensíveis
        ];

        dieJson(200, $data);
    }
}
