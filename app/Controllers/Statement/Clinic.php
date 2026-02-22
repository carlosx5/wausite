<?php

namespace App\Controllers\Statement;

use App\Controllers\BaseController;

class Clinic extends BaseController
{
    public function index()
    {
        $this->initBackend(113);

        //:SIDEBAR
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Extratos',
            'viewTitle' => 'Extrato Clínicas',
            'contenList' => ['statement/sidebarClinic'],
        ]);

        //:DATA
        $y = $this->permission_check(9, false);
        $data = $this->dataCreate(
            [
                'statement/statement',
                'modules/calendar/calendar_days'
            ],
            [
                'sidebar/sidebarFilter',//:SIDEBAR - FILTROS DE DATA
                'statement/statement',
                'statement/clinic',
                'modules/bank/bank_register_module',
                $y ? 'modules/bank/bank_check_module' : '',//:MODULO DE CHECK
                'modules/calendar/calendar_days'
            ],
            'statement_clinic'
        );
        $data['title'] = 'Clínica';
        $data['multiEntryAdd'] = null;
        $data['varJS']['table'] = 'clinic';

        return viewShow('statement/_statement', $data);
    }
}
