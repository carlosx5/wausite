<?php

namespace App\Controllers\Client\Calendar;

use App\Controllers\UnloggedController;

class Calendar_confirm extends UnloggedController
{
    /**
     * Método de tela
     */
    public function index()
    {
        $data = $this->dataCreate(
            'client/calendar/calendar_confirm',
            ''
        );

        $data['logoLab'] = base_Url('/img/logos/arc/arc1_01.webp');

        echo view('templates/_header.html', $data);
        echo view('client/calendar/calendar_confirm.html');
        echo view('templates/_footer.html');
    }
}
