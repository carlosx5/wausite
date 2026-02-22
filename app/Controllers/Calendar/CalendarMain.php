<?php

namespace App\Controllers\Calendar;

use App\Controllers\ViewController;

class CalendarMain extends ViewController
{
    public function index(): void
    {
        $this->initBackend('127P');

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Agenda',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            "p-calendar.min,p-flatpickr,calendar/calendarMain",
            "p-calendar/main.min,p-flatpickr,calendar/calendarMain",
            'calendar'
        );

        $data['findClinicAccess'] = hasPermission('55P');
        $data['findProfAccess'] = hasPermission('141P');

        viewShow('calendar/calendarMain', $data);
    }
}
