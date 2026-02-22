<?php

namespace App\Controllers\User\Doctor;

use App\Controllers\FetchController;
use App\Models\User\Register\UserRegister_Model;

class DoctorFind extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE MEDICOS
    public function find()
    {
        parent::initFetch('85P', false);

        //:Verifica se "mainClinicActive" está ativo e se tem permissão
        $mainClinicActive = (+getCook('mainClinicActive') && hasPermission('55P')) ? true : null;

        //:Instancia o modelo de registro do banco
        $modRegister = new UserRegister_Model();

        //:Busca variável 'find' da requisição
        $find = $this->request->getVar('find');

        //:Cria $where
        $where = 'us.status = 1 AND user.function = 5';
        if ($mainClinicActive) { //:Clinicas da matriz
            $clinicMainId = session()->clinic['idMain'];
            $where .= " AND cl.id_clinicMain = {$clinicMainId}";
        } else { //:Clinicas do login
            $clinicId = session()->clinic['id'];
            $where .= " AND user.id_clinic = {$clinicId}";
        }

        //:Retorna 'list' em fetch
        $returnData['list'] = $modRegister
            ->select('
                user.id,
                user.name_social as col2,
                user.id_clinic,
            ')
            ->like('user.name_social', $find, 'after')
            ->where($where)
            ->join('user__status us', 'us.id = user.id', 'left')
            ->join('clinic cl', 'user.id_clinic = cl.id', 'left')
            ->orderBy('user.name_social')
            ->findAll(15);

        dieJson(200, $returnData);
    }
}
