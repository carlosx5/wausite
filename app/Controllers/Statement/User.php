<?php

namespace App\Controllers\Statement;

use App\Controllers\BaseController;

class User extends BaseController
{
    public function index()
    {
        $this->initBackend([112, 115, 116, 117]);

        //:SIDEBAR
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Extratos',
            'viewTitle' => 'Extrato Usuários',
            'contenList' => ['statement/sidebarUser'],
        ]);

        //:DATA
        $y = $this->permission_check(9, false);
        $data = $this->dataCreate(
            [
                'statement/statement',
                'modules/calendar/calendar_days'
            ],
            [
                'sidebar/sidebarFilter', //:SIDEBAR - FILTROS DE DATA
                'statement/statement',
                'statement/user',
                'modules/bank/bank_register_module',
                $y ? 'modules/bank/bank_check_module' : '', //:MODULO DE CHECK
                'modules/calendar/calendar_days'
            ],
            'statement_user'
        );
        $data['title'] = 'Usuário';
        $data['multiEntryAdd'] = null;
        $data['varJS']['table'] = 'user';

        return viewShow('statement/_statement', $data);
    }

    /**
     * Métoto para buscar usuário
     */
    public function find()
    {
        $this->permission_check([53, 62, 82, 85]);

        $find = $this->request->getVar('find');

        $data['list'] = db_connect()->table('user')
            ->select('user.id, user.name as col1, clinic.name_short as col2')
            ->like('user.name_short', $find, 'LEFT')
            ->join('clinic', 'clinic.id = user.id_clinic', 'left')
            ->orderBy('user.name_short')
            ->get()
            ->getResultArray();

        $data['status'] = 200;
        echo json_encode($data);
        die;
    }
}
