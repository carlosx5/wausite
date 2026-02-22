<?php

namespace App\Controllers\z_templates;

use App\Controllers\FetchController;
use App\Models\Bank\Register\BankRegister_Model;

class Z_Find extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE BANCOS
    public function find()
    {
        parent::initFetch('68P', false);

        //:Verifica se "mainClinicActive" está ativo e se tem permissão
        $mainClinicActive = (+getCook('mainClinicActive') && hasPermission(55)) ? true : null;

        //:Instancia o modelo de registro do banco
        $modRegister = new BankRegister_Model();

        //:Busca variável 'find' da requisição
        $find = $this->request->getVar('find');

        //:Cria $where
        if ($mainClinicActive) { //:Clinicas da matriz
            $clinicId = session()->clinic['idMain'];
            $where = "cl.id_clinicMain = {$clinicId}";
        } else { //:Clinicas do login
            $clinicId = session()->clinic['id'];
            $where = "bank.id_clinic = {$clinicId}";
        }

        //:Retorna 'list' em fetch
        $returnData['list'] = $modRegister
            ->select('
                bank.id,
                bank.name_social as col2,
                bank.id_clinic,
            ')
            ->like('bank.name', $find, 'after')
            ->where($where)
            ->join('clinic cl', 'bank.id_clinic = cl.id', 'left')
            ->orderBy('bank.name_social')
            ->findAll(15);

        dieJson(200, $returnData);
    }
}
