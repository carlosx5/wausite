<?php

namespace App\Controllers\Marketing\Lead\Report;

use App\Controllers\BaseController;
use App\Models\Marketing\Lead\Report_Model;

class Report extends BaseController
{
    public function __construct()
    {
        $this->modLead = new Report_Model();
    }

    public function index()
    {
        $this->initBackend(9);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Marketing',
            'viewTitle' => 'Leads',
            'contenList' => ['marketing/lead/report/sidebar'],
        ]);

        $uri = uri_string();
        $data = $this->dataCreate($uri, $uri, 'lead_report');

        return (viewShow($uri, $data));
    }

    public function getList()
    {
        $this->initFetch(159);

        //BUSCA LISTA
        $where = "id > '8840' AND name > ''";
        $data['list'] = $this->modLead->getList($where);

        $data['statusList'] = $this->statusList();

        return $this->json(200, $data);
    }

    public function updateStatus()
    {
        $id = $this->initFetch(160, 'id_lead');

        $data = ['id_status' => $this->request->getVar('id_status')];

        $this->modLead->protect(false)->update($id, $data);

        $this->getList();
    }

    public function statusList()
    {
        return [
            ['id' => 0, 'ord' => 1, 'name' => 'Novo', 'color' => '#fff'],
            ['id' => 1, 'ord' => 2, 'name' => 'Retorno', 'color' => '#ff4500'],
            ['id' => 2, 'ord' => 3, 'name' => 'Excluido', 'color' => '#777'],
            ['id' => 3, 'ord' => 4, 'name' => 'Acompanhar', 'color' => '#ea00ff'],
            ['id' => 4, 'ord' => 5, 'name' => 'Negociando', 'color' => '#48ff00'],
        ];
    }
}
