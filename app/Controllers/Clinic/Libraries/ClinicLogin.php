<?php

namespace App\Controllers\Clinic\Libraries;

use App\Controllers\FetchController;
use App\Models\Clinic\ClinicRegister_Model;

class ClinicLogin extends FetchController
{
    private $modClinic;

    public function __construct()
    {
        $this->modClinic = new ClinicRegister_Model();
    }

    public function changeLogClinic()
    {
        parent::initFetch('124P', false);
        helper('cookie');

        $clinicId = $this->request->getVar('clinicId');

        //:Busca "clínica"
        $clinicData = $this->modClinic
            ->select("
                id,
                id_clinicMain,
                name_social,
                procedureClinicMasterActive,
            ")
            ->find($clinicId);
        //:Se não encontrar clínica -> retorna erro
        if (empty($clinicData))
            dieJson(456, 'WAU-0100');
        //:Se clínica não for a correta -> retorna erro
        if ($clinicData->id != $clinicId)
            dieJson(456, 'WAU-0101');
        //:Se clínica matriz não for a correta -> retorna erro
        if ($clinicData->id_clinicMain != session('clinic')['idMain'])
            dieJson(456, 'WAU-0102');

        //:Atualiza os dados da clínica na session
        $clinic = session('clinic');
        $clinic['id'] = $clinicId;
        $clinic['nameSocial'] = $clinicData->name_social;
        $clinic['procedureClinicMasterActive'] = $clinicData->procedureClinicMasterActive;
        session()->set('clinic', $clinic);

        //:Atualiza os cookies
        setCook('log_clinicId', $clinicData->id);
        setCook('log_clinicName', $clinicData->name_social);

        //:Remove dados da tela de validação
        session()->remove('currentRecordValidationParams');

        dieJson(200);
    }
}
