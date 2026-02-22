<?php

namespace App\Controllers\Patient\Libraries;

use App\Controllers\FetchController;
use App\Models\Clinic\ClinicRegister_Model;

class PatientClinic extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE CLINICAS
    public function find()
    {
        parent::initFetch('96P', false);

        $find = $this->request->getVar('find');
        $mainClinicId = session()->get()['clinic']['idMain'];

        $modRegister = new ClinicRegister_Model();

        $data['list'] = $modRegister
            ->select('id, name_social as col2')
            ->like('name_social', $find, 'left')
            ->where('id_clinicMain', $mainClinicId)
            ->orderBy('name_social')
            ->findAll(15);

        dieJson(200, $data);
    }
}
