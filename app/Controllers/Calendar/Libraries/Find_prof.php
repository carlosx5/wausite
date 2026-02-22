<?php

namespace App\Controllers\Calendar\Libraries;

use App\Controllers\FetchController;
use App\Models\User\Register\UserRegister_Model;

class Find_prof extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE USUÁRIOS
    public function find()
    {
        parent::initFetch('12P', false);

        $find = $this->request->getVar('find');
        $allProfs = $this->request->getVar('parameter')->allProfs ?? null;
        $clinicId = session('clinic')['id'];
        $returnData = [];

        $modRegister = new UserRegister_Model();

        //:Cria $where
        $where = "user.id_clinic = $clinicId AND us.status = 1";

        $returnData['list'] = $modRegister
            ->select("
                user.id,
                user.name as col2,
                user.id_clinic,
            ")
            ->where($where)
            ->like('user.name', $find, 'after')
            ->like('user.activity', ',6,') //:Profissional de Saúde
            ->join('user__status us', 'user.id = us.id', 'left')
            ->join('clinic cl', 'user.id_clinic = cl.id', 'left')
            ->orderBy('user.name')
            ->findAll(15);

        //:Adiciona "Todos" no inicio da lista
        if ($allProfs)
            array_unshift($returnData['list'], ['id' => 0, 'col2' => 'Todos']);

        dieJson(200, $returnData);
    }
}
