<?php

namespace App\Controllers\Report\Libraries;

use App\Controllers\FetchController;
use App\Models\Clinic\ClinicRegister_Model;

class Find_clinic extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE CLÍNICAS
    public function find()
    {
        parent::initFetch('55P', false);

        $find = $this->request->getVar('find');
        $mainClinicId = session('clinic')['idMain'];
        $returnData = [];

        $modClinic = new ClinicRegister_Model();

        //:Cria $where
        $where = [];
        $where["id_clinicMain"] = $mainClinicId;

        $returnData['list'] = $modClinic
            ->select("
                id,
                name_social as name
            ")
            ->like('name_social', $find, 'after')
            ->where($where)
            ->orderBy('name_social')
            ->findAll(15);

        dieJson(200, $returnData);
    }
}
