<?php

namespace App\Controllers\Tools\Tools;

use App\Controllers\FetchController;
use App\Models\Country\Country_Model;

class Country extends FetchController
{
    protected $modCountry;

    public function __construct()
    {
        $this->modCountry = new Country_Model();
    }

    public function find()
    {
        $this->initFetch(999);

        $find = $this->request->getVar('find');

        $q = $this->modCountry;
        $q->select('id, ddi as col2, country as col3, img1 as phone_flag1, img2 as phone_flag2');
        $q->like('country', $find, 'LEFT');
        $q->orderBy('country');
        $data['list'] = $q->findAll(30);

        dieJson(200, $data);
    }

    public function getData()
    {
        $this->initFetch(999);

        $ddiId = $this->request->getVar('ddiId');

        $resp = $this->modCountry->select('id, ddi, img, img1')->find($ddiId);

        $resp->img = $resp->img1
            ? "https://flagcdn.com/w40/$resp->img1.webp"
            : "https://upload.wikimedia.org/wikipedia/commons/thumb/$resp->img";

        dieJson(200, $resp);
    }
}
