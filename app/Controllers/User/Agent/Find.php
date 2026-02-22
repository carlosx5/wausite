<?php

namespace App\Controllers\User\Agent;

use App\Controllers\BaseController;
use App\Models\User\User_register_Model;

class Find extends BaseController
{
    private $modUser;

    public function __construct()
    {
        $this->modUser = new User_register_Model();
    }

    //:RETORNA REQUEST DE BUSCA DE AGENTES
    public function findAgent()
    {
        $this->initFetch(999);

        $username = $this->request->getVar('find');
        $parameter = $this->request->getVar('parameter');

        $selectName = $parameter == 'short' ? 'name_short' : 'name';

        $data['list'] = $this->modUser
            ->select("user.id, user.{$selectName} as col2")
            ->where('us.status', 1)
            ->like("user.activity", ',6,', 'LEFT')
            ->like("user.{$selectName}", $username, 'LEFT')
            ->join('user__status us', 'us.id = user.id', 'left')
            ->orderBy('user.name_short')
            ->findAll(30);

        return $this->json(200, $data);
    }
}
