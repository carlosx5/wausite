<?php

namespace App\Controllers\User\Libraries;

use App\Controllers\FetchController;
use App\Models\User\Register\UserRegister_Model;

class Find_user extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE USUÁRIOS
    public function find()
    {
        parent::initFetch('53P', false);

        $find = $this->request->getVar('find');

        //:Verifica se "mainClinicActive" está ativo e se tem permissão
        $mainClinicActive = (+getCook('mainClinicActive') && hasPermission(55)) ? true : null;

        $modRegister = new UserRegister_Model();

        //:Cria $where
        if ($mainClinicActive) { //:Clinicas da matriz
            $clinicId = session()->clinic['idMain'];
            $where = "cl.id_clinicMain = {$clinicId}";
        } else { //:Clinicas do login
            $clinicId = session()->clinic['id'];
            $where = "user.id_clinic = {$clinicId}";
        }
        ///
        $where .= ' and us.status = 1';

        $data['list'] = $modRegister
            ->select('
                user.id,
                user.name as col2,
                user.id_clinic,
            ')
            ->like('user.name', $find, 'after')
            ->where($where)
            ->join('user__status us', 'user.id = us.id', 'left')
            ->join('clinic cl', 'user.id_clinic = cl.id', 'left')
            ->orderBy('user.name')
            ->findAll(15);

        dieJson(200, $data);
    }
}
