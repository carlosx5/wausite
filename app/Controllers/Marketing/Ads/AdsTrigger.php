<?php

namespace App\Controllers\Marketing\Ads;

use App\Controllers\BaseController;
use App\Models\Marketing\Ads\AdsTrigger_Model;

class AdsTrigger extends BaseController
{
    private $modTrigger;

    public function __construct()
    {
        $this->modTrigger = new AdsTrigger_Model();
    }

    public function index()
    {
        // $resp1 = base64url_encode(str_pad(2, 7, "0", STR_PAD_LEFT));
        //* 1=SEM ADS
        //* 5=BIO DO INSTAGRAM
        //* 6=LINK DO WHATSAPP
        $resp1 = base64url_encode(6);
        $resp2 = base64url_decode($resp1);
        dj("$resp1 $resp2");

        $this->initBackend(9);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Marketing',
            'viewTitle' => 'Marketing Ads',
            'contenList' => ['marketing/ads/adsTrigger_sidebar'],
        ]);

        $uri = uri_string();
        $data = $this->dataCreate(
            $uri,
            $uri,
            'teste'
        );

        return viewShow($uri, $data);
    }

    public function set()
    {
        $id = 8;
        $resp1 = str_pad($id, 7, "0", STR_PAD_LEFT);
        $resp1 = base64url_encode($resp1);
        $resp2 = base64url_decode($resp1);

        dj("$resp1 $resp2");

        $id = $this->modTrigger->saveWau([

        ]);

        dieJson(200, $id);
    }
}