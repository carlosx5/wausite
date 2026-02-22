<?php

namespace App\Controllers\Dev;

use App\Controllers\FetchController;
use App\Models\Config_Model;

class DevNewCode extends FetchController
{
    private $permis;
    private $modConfig;

    public function __construct()
    {
        //:Se for debugger, libera tudo
        $this->permis = session()->debugger == 1 ? '999P' : '9P';

        $this->modConfig = new Config_Model();
    }

    public function get()
    {
        parent::initFetch($this->permis, false);

        $data['template'] = view("dev/lastcodeModal.html");
        $data['lastCode'] = $this->modConfig
            ->select('value')
            ->where('name', 'wau-lastCode')
            ->first();

        dieJson(200, $data);
    }

    public function set()
    {
        parent::initFetch($this->permis, false);

        $newCode = $this->request->getVar("newCode");

        $data = $this->modConfig
            ->protect(false)
            ->set('value', $newCode)
            ->where('name', 'wau-lastCode')
            ->update();

        dieJson(200, $data);
    }
}
