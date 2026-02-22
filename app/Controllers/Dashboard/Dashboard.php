<?php

namespace App\Controllers\Dashboard;

use App\Controllers\BaseController;
use App\Models\Dashboard\Dashboard_Model;
use App\Models\Os\Os_register_Model;

class Dashboard extends BaseController
{
    public function index()
    {
        $this->initBackend(69);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Dashboard',
            'viewTitle' => 'Dashboard',
            'contenList' => ['dashboard_btn_layout'],
        ]);

        // $data = $this->dataCreate(
        //     'dashboard/dashboard',
        //     'p-apexcharts.min,modules/bank/bank_register_module,dashboard/dashboard,modules/bank/bank_check_module'
        // );

        // return(viewShow('dashboard/dashboard', $data));
    }

    public function getGraphic()
    {
        $this->initFetch(126);
        helper('arrayFinder');

        $osm = new Os_register_model();
        $expenseModel = new Dashboard_Model();

        $userOnly = checkAccess(113) ? 0 : 1;
        $user_id = session()->log_userId;
        $monthStart = '2022-05';//IRÁ COMEÇAR NO MÊS SEGUINTE
        $filterExpenseType = $this->request->getVar('filterExpenseType');

        //BUSCA OS TODAS
        $osm->select('
            sum(vl_invoice) - sum(vl_gloss) as vlInvoice,
            sum(vl_reimbursement) as vlReimbursement,
            os_old.month as dt,
        ');
        $osm->where('month >', $monthStart);
        $osm->where('deleted_at', null);
        $osm->groupBy('month');
        $list = $osm->get()->getResultArray();

        //BUSCA OS TODAS QUE NÃO POSSUEM VALOR DE NOTA
        // $osm->select('
        //     sum(vl_reimbursement) as vlReimbursement,
        //     os_old.month as dt,
        // ');
        // $osm->where('vl_invoice', 0);
        // $osm->where('month >', $monthStart);
        // $osm->where('deleted_at', null);
        // $osm->groupBy('month');
        // $listNoInvoice = $osm->get()->getResultArray();

        //BUSCA OS COM FECHAMENTO
        $osm->select('
            sum(vl_reimbursement) as vlReimbursement,
            sum(vl_clinic) + sum(vl_operational) as vlClinic,
            os_old.month as dt,
        ');
        $osm->where('month >', $monthStart);
        $osm->where('status_next', 90);
        $osm->where('deleted_at', null);
        $osm->groupBy('month');
        $listClosed = $osm->get()->getResultArray();

        //BUSCA DESPESA
        $listExpense = $expenseModel->getExpenseResultSum($userOnly, $user_id, $filterExpenseType);

        foreach ($list as $key => $l) {
            $month = $l['dt'];
            $vlGrossRevenue = 0;
            $vlExpense = 0;

            //ADICIONA 'vlClosed' e 'vlClinic'
            $key2 = searchInArray($listClosed, $month, true, 'dt');
            if ($key2 > -1) {
                $list[$key]['vlClosed'] = $listClosed[$key2]['vlReimbursement'];
                $list[$key]['vlClinic'] = $listClosed[$key2]['vlClinic'];
                $vlGrossRevenue = $list[$key]['vlClinic'];
            }

            //ADICIONA 'vlExpense'
            $key3 = searchInArray($listExpense, $month, true, 'dt') ?? '';
            if ($key3 > -1) {
                $list[$key]['vlExpense'] = $listExpense[$key3]['vlExpense'];
                $vlExpense = $list[$key]['vlExpense'];
            }

            //ADICIONA 'vlNetEarning'
            $list[$key]['vlNetEarning'] = ($vlGrossRevenue - $vlExpense);
        }

        $data['filterExpenseType'] = $filterExpenseType;
        $data['list'] = $list;
        return $this->json(200, $data);
    }

    public function getExpenseResultList()
    {
        $this->initFetch(126);

        $month = $this->request->getVar('month');
        $user = $this->request->getVar('user');
        $filterExpenseId = $this->request->getVar('filterExpenseId');

        //BUSCA DESPESA
        $expenseModel = new Dashboard_Model();
        $data['list'] = $expenseModel->getExpenseResultList($month, $user, $filterExpenseId);

        return $this->json(200, $data);
    }
}
