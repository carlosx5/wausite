<?php

namespace App\Controllers\Clinic\Branch;

use App\Controllers\Clinic\ClinicMain;

class ClinicBranch extends ClinicMain
{
    //:RETORNA REQUEST DE DADOS DAS FILIAIS
    public function getData(): void
    {
        $sessionValues = $this->clinicMain(54, true);
        $returnData = [];

        //:Retorna dados da matriz
        $returnData['mainClinic'] = $this->getMainClinic($sessionValues->clinicMainId);

        //:Retorna lista de filiais
        $returnData['branchList'] = $this->getBranchList($sessionValues->clinicMainId);

        //:Retorna valores para Local Storage
        $returnData['localStorage'] = [
            'clinicId' => $sessionValues->id,
            'clinicName' => $sessionValues->clinicName,
        ];

        dieJson(200, $returnData);
    }

    //:RETORDA DADOS DA MATRIZ
    private function getMainClinic($clinicMainId)
    {
        if (empty($clinicMainId))
            return null;

        $resp = $this->modClinicRegister
            ->select("
                id,
                name_short
            ")
            ->where('id', $clinicMainId)
            ->first();

        return $resp;
    }


    //:RETORNA LISTA DAS FILIAIS
    private function getBranchList($clinicMainId)
    {
        if (empty($clinicMainId))
            return null;

        $resp = $this->modClinicRegister
            ->select("
                id,
                name_short
            ")
            ->where('id_clinicMain', $clinicMainId)
            ->where('id !=', $clinicMainId)
            ->findAll();

        return $resp;
    }
}
