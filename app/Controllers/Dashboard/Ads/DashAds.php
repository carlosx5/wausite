<?php

namespace App\Controllers\Dashboard\Ads;

use App\Controllers\BaseController;
use App\Models\Dashboard\Dashboard_Model;
use App\Models\Marketing\Lead\Marketing_lead_Model;

class DashAds extends BaseController
{
    private $modLeads;

    public function __construct()
    {
        $this->modLeads = new Marketing_lead_Model();
    }

    public function index()
    {
        $this->initBackend(126);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Dashboard',
            'viewTitle' => 'Acessos Site',
            'contenList' => ['dashboard/ads/sidebar'],
        ]);

        $uri = uri_string();
        $data = $this->dataCreate(
            $uri,
            $uri,
            'dashAds'
        );

        return viewShow($uri, $data);
    }

    public function getList()
    {
        $this->initFetch(126);

        $dateIn = $this->request->getVar('dateIn');
        $dateOut = $this->request->getVar('dateOut');

        //-BUSCA LISTA
        $data['list'] = $this->modLeads
            ->select("
                old_marketing_leads.id,
                old_marketing_leads.ads,
                old_marketing_leads.section_count,
                DATE_FORMAT(old_marketing_leads.timer, '%H:%i:%s') as timer,
                old_marketing_leads.zap_count,
                old_marketing_leads.video_count,
                old_marketing_leads.screen,
                old_marketing_leads.ip,
                old_marketing_leads.name,
                old_marketing_leads.os,
                old_marketing_leads.city,
                old_marketing_leads.state,
                old_marketing_leads.country,
                DATE_FORMAT(old_marketing_leads.updated_at, '%d/%m/%Y %H:%i') as updated_at,
                at.name as triggerName,
            ")
            ->join('ads_trigger at', 'at.id = old_marketing_leads.ads', 'LEFT')
            ->where("updated_at >= '$dateIn 00:00:00' AND updated_at <= '$dateOut 23:59:59'")
            ->orderBy('updated_at', 'DESC')
            ->findAll();

        dieJson(200, $data);
    }

    public function setName()
    {
        $listId = $this->initFetch(9, 'listId');

        $listName = $this->request->getVar('listName');

        $resp = $this->modLeads->protect(false)->update($listId, ['name' => $listName]);

        dieJson(200, $resp);
    }

    public function delList()
    {
        $listId = $this->initFetch(9, 'listId');

        $resp = $this->modLeads->protect(false)->delete($listId);

        dieJson(200, $resp);
    }
}
