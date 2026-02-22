<?php

namespace App\Controllers\Statement;

use App\Controllers\BaseController;
use App\Models\Bank\Bank_locked_day_Model;

class Bank extends BaseController
{
    private $modBankLockedDay;

    public function __construct()
    {
        $this->modBankLockedDay = new Bank_locked_day_Model();
    }

    /** //-TELA */
    public function index()
    {
        $this->initBackend(114);

        //:SIDEBAR
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Extratos',
            'viewTitle' => 'Extrato Bancário',
            'contenList' => ['statement/sidebarBank', 'statement/_sidebarTools'],
        ]);

        //:DATA
        $y = $this->permission_check(9, false);
        $data = $this->dataCreate(
            [
                'statement/statement',
                'modules/calendar/calendar_days',
                // $y ? 'bank/entry/multiEntryAdd' : '',//:MULTIPLOS LANÇAMENTOS
                // $y ? 'bank/entry/entryMultiExpense' : '',//:MULTIPLAS DESPESAS
            ],
            [
                'bank/entry/entryAdd',
                'factory/ajaxSelect',
                'sidebar/sidebarFilter',//:SIDEBAR - FILTROS DE DATA
                'statement/statement',
                'statement/bank',
                'modules/bank/bank_register_module',
                $y ? 'modules/bank/bank_check_module' : '',//:MODULO DE CHECK
                'modules/calendar/calendar_days',
                // $y ? 'bank/entry/entryMultiExpense' : '',//:MULTIPLAS DESPESAS
            ],
            'statement_bank'
        );
        $data['title'] = 'Banco';
        $data['multiEntryAdd'] = $y;
        $data['varJS']['table'] = 'bank';

        return viewShow('statement/_statement', $data);
    }

    /** //+BUSCA ULTIMA DATA BLOQUEADA */
    public function getLastLockedDay()
    {
        $bankId = $this->initFetch(9, 'bankId');
        $bankId = ",$bankId,";

        $resp = $this->modBankLockedDay
            ->select('date')
            ->like('bankList', $bankId)
            ->orderBy('date DESC')
            ->first();

        return $this->json(200, $resp);
    }

    /** //+BUSCA LISTA DE DIAS BLOQUEADOS NO MÊS */
    public function getLockedDaysList()
    {
        $bankId = $this->initFetch(58, 'bankId');
        $bankId = ",$bankId,";
        $month = $this->request->getVar('month');

        //:BUSCA DADOS
        $resp = $this->modBankLockedDay
            ->select("
                DAY(date) as day
            ")
            ->where("MONTH(date)", $month)
            ->like('bankList', $bankId)
            ->orderBy('date DESC')
            ->findAll();

        //:CRIA LISTA SÓ COM OS DIAS
        $list = [];
        foreach ($resp as $vl) {
            array_push($list, intval($vl->day));
        }

        return $this->json(200, ['list' => $list]);
    }

    /** //+BLOQUEIA/DESBLOQUEIA UMA DATA */
    public function dateLocked()
    {
        $bankId = $this->initFetch('166,167', 'bankId');
        $bankId = ",$bankId,";
        $date = $this->request->getVar('date');

        //:BUSCA DADOS
        $bankList = $this->modBankLockedDay
            ->select('id, bankList')
            ->where('date', $date)
            ->first();

        //:ADICIONA OU REMOVE BANCO
        if (!exists($bankList->bankList, $bankId)) {//:ADICIONA
            if (!$this->permission_check(166, false))
                dieJson(999, 'Sem permissão para boquear data!');

            $newBankList = strArray($bankList->bankList, $bankId);
        } else {//:REMOVE
            if (!$this->permission_check(167, false))
                dieJson(999, 'Sem permissão para desbloquear data!');

            $newBankList = str_replace($bankId, ',', $bankList->bankList);
            $newBankList = $newBankList == ',' ? '' : $newBankList;
        }

        //:SALVA DADOS
        $response = $this->modBankLockedDay
            ->protect(false)
            ->update($bankList->id, ['bankList' => $newBankList]);

        return $this->json(200, $response);
    }
}