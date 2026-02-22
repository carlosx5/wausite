<?php

namespace App\Controllers\Procedure\Libraries;

use App\Controllers\FetchController;
use App\Models\Procedure\Procedure_Model;

class Find_procedure extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE PACIENTES
    public function find()
    {
        parent::initFetch('999P', false);

        $find = $this->request->getVar('find');
        $pcma = session('clinic')['procedureClinicMasterActive'];
        $where = [];

        if ($pcma) {
            $where['id_clinicMain'] = session('clinic')['idMain'];
        } else {
            $where['id_clinic'] = session('clinic')['id'];
        }

        $modProcedure = new Procedure_Model();

        $data['list'] = $modProcedure
            ->select('id, name as col2')
            ->like('name', $find, 'after')
            ->where($where)
            ->orderBy('name')
            ->limit(20)
            ->findAll();

        array_push($data['list'], [
            'id' => 0,
            'col2' => 'Nenhum',
        ]);

        dieJson(200, $data);
    }
}
