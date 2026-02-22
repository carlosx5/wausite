<?php

namespace App\Controllers\Clinic\Register;

use App\Controllers\FetchController;
use App\Models\Clinic\ClinicRegister_Model;

class ClinicRegister extends FetchController
{
    private $modClinic;

    public function __construct()
    {
        $this->modClinic = new ClinicRegister_Model();
    }

    //:RETORNA REQUEST DE DADOS DA CLÍNICA
    public function getData($clinicId = null)
    {
        parent::initFetch('54P', false);

        $clinicId ??= $this->request->getVar("clinicId");
        $returnData = [];

        //:Busca "clinica"
        $clinicData = $this->getClinic($clinicId);

        //:Retorna "register"
        $returnData['clinic'] = $clinicData;

        dieJson(200, $returnData);
    }

    //:RETORNA DADOS DA CLÍNICA
    private function getClinic($clinicId)
    {
        if (empty($clinicId))
            return null;

        $clinicRegister = $this->modClinic
            ->select("
                clinic.*,
                clinic.updated_at   as optLock,
            ")
            ->where('clinic.id', $clinicId)
            ->first();

        return $clinicRegister;
    }

    //:SALVA DADOS DA CLÍNICA
    public function setClinic()
    {
        $optLock = parent::initFetch('55P', true);

        $dbInput = $this->request->getVar('data')->clinic;
        $clinicId = $dbInput->id;

        if ((int) $clinicId > 0) { //.Update
            //:Busca "usuário"
            $clinicData = $this->getClinic($clinicId);

            //:Valida Optimistic Lock
            if ($clinicData->optLock !== $optLock)
                dieJson(453, 'WAU-0168');

            $resp = $this->modClinic->protect(false)->update($clinicId, $dbInput);
        } else { //.Insert
            $resp = $this->modClinic->protect(false)->insert($dbInput);
            $clinicId = $resp;
        }

        $this->getData($clinicId);
    }
}
