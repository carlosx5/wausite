<?php

namespace App\Controllers\Report\Libraries;

use App\Controllers\FetchController;
use App\Models\User\Register\UserRegister_Model;

class Find_prof extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE PROFISSIONAIS
    public function find()
    {
        parent::initFetch('125P', false);

        $find = $this->request->getVar('find');
        $clinicId = session('clinic')['id'];
        $returnData = [];

        $modRegister = new UserRegister_Model();

        //:Cria $where
        $where = "user.id_clinic = $clinicId AND us.status = 1";

        $returnData['list'] = $modRegister
            ->select('
                user.id,
                user.name_social as name,
            ')
            ->like('user.name_social', $find, 'after')
            ->like('user.activity', ',6,') //:Profissional de Saúde
            ->where($where)
            ->join('user__status us', 'user.id = us.id', 'left')
            ->orderBy('user.name_social')
            ->findAll(15);

        dieJson(200, $returnData);
    }
}
