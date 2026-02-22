<?php

namespace App\Controllers\Archive\Image;

use App\Controllers\FetchController;
use App\Controllers\Archive\Libraries\Key;
use App\Controllers\Archive\Libraries\SaveArchive;
use App\Controllers\Archive\Libraries\DataModule;
use App\Models\Patient\Register\PatientRegister_Model;

class ArchiveImage extends FetchController
{
    private $modPatient;
    private $clinicId;

    public function __construct()
    {
        $this->modPatient = new PatientRegister_Model();
        $this->clinicId = session('clinic')['id'];
    }

    //:RETORNA REQUEST COM LISTA DE DOCUMENTOS
    public function getData()
    {
        $imgMethod =  $this->request->getVar('header');
        $dataModule = $this->dataModule($imgMethod);

        parent::initFetch($dataModule->permGetData, false);
        $returnData = [];

        $patientId = $this->request->getVar("patientId");

        $patientData = $this->getPatient($patientId);

        //:Retorna dados do paciente
        $returnData['patient'] = $patientData;

        //:Retorna lista de documentos
        $returnData['imageList'] = $this->getImageList($patientId, $dataModule->modImage, $dataModule->method);

        dieJson(200, $returnData);
    }

    //:RETORNA CADASTRO DO PACIENTE 
    private function getPatient($patientId)
    {
        $resp =  $this->modPatient
            ->select("
                patient.*,
                patient.updated_at  as optLock,
                clinic.id           as id_clinic,
                clinic.name_social  as nm_clinic,
                os.id               as checkIdOs,
                record.id           as checkIdRecord,
            ")
            ->join('os',                'os.id_patient = patient.id',                               'left')
            ->join('record',            'record.id_patient = patient.id',                           'left')
            ->join('clinic',            'clinic.id = patient.id_clinic',                            'left')
            ->where('patient.id', $patientId)
            ->first();

        //:Se não encontrar paciente -> retorna erro
        if (empty($resp))
            dieJson(456, 'WAU-0104');

        //:Se clínica do paciente for diferente da clínica da session -> retorna erro
        if ($resp->id_clinic != session('clinic')['id'])
            dieJson(458, 'WAU-0105');

        return $resp;
    }

    //:RETORNA LISTA DE DOCUMENTOS
    private function getImageList($patientId, $modImage, $method)
    {
        $table = "archive__$method";

        $resp = $modImage
            ->select("
                $table.*,
                prof.name_social as profName
            ")
            ->where('id_patient', $patientId)
            ->join('user prof', "prof.id = $table.id_login", 'left')
            ->findAll();

        return $resp;
    }

    public function getQrKey()
    {
        $imgMethod =  $this->request->getVar('header');
        $dataModule = $this->dataModule($imgMethod);

        parent::initFetch($dataModule->permSave, false);
        $returnData = [];

        $patientId = $this->request->getVar("patientId");

        $resp = $this->modPatient
            ->select("id_clinic")
            ->where('id', $patientId)
            ->first();

        //:Se não encontrar paciente -> retorna erro
        if (empty($resp))
            dieJson(456, 'WAU-0118');

        //:Se clínica do paciente for diferente da clínica da session -> retorna erro
        if ($resp->id_clinic != session('clinic')['id'])
            dieJson(458, 'WAU-0119');

        //:Retorna qrcode key
        $returnData['qrKey'] = Key::encodeQrKey($patientId, $dataModule->method, 10);

        dieJson(200, $returnData);
    }

    //:SALVA DOCUMENTO
    public function setImage()
    {
        $imgMethod =  $this->request->getPost('header');
        $dataModule = $this->dataModule($imgMethod);
        $patientId = $this->request->getPost('patientId');

        $optLock = parent::initFetch($dataModule->permSave, true);

        //:Busca "paciente"
        $patientData = $this->getPatient($patientId);

        //:Valida Optimistic Lock
        if ($patientData->optLock !== $optLock)
            dieJson(453);

        //:Checa se o arquivo veio em fetch
        if (!isset($_FILES['fotos']['tmp_name'][0]))
            dieJson(400, 'WAU-0106');

        //:Pega o arquivo
        $fileTmp = $_FILES['fotos']['tmp_name'][0];
        $fileType = $_FILES['fotos']['type'][0];

        parent::optLockRefresh($this->modPatient, $patientId);

        //:Salva documento
        $libSaveArchive = new SaveArchive();
        $resp = $libSaveArchive->render(
            $patientId,
            session('clinic')['id'],
            session()->log_userId,
            $fileTmp,
            $fileType,
            $dataModule->archiveFolder,
            $dataModule->modImage
        );

        $this->getData();
    }

    //:DELETA DOCUMENTO
    public function delImage()
    {
        $imgMethod =  $this->request->getVar('header');
        $patientId = (int) $this->request->getVar('patientId');
        $imageId = (int) $this->request->getVar('imageId');
        $dataModule = $this->dataModule($imgMethod);

        $optLock = parent::initFetch([$dataModule->permDelMy, $dataModule->permDelClinic], true);

        //:Busca "paciente"
        $patientData = $this->getPatient($patientId);

        //:Valida Optimistic Lock
        if ($patientData->optLock !== $optLock)
            dieJson(453);

        //:Valida id do documento
        if ($imageId <= 0)
            dieJson(454, 'WAU-0114');

        //:Busca dados do documento
        $imageData = $dataModule->modImage
            ->where('id', $imageId)
            ->first();
        if (empty($imageData))
            dieJson(456, 'WAU-0115');

        //:Se documento não pertence ao usuário logado
        if ($imageData->id_login != session('log_userId')) {
            //:Se não tem permissão de deletar documentos de outros usuários
            if (!hasPermission($dataModule->permDelClinic))
                dieJson(468, 'WAU-0116');
        }

        //:Deleta documento na pasta
        $fileClinicFolder = padWithZeros($this->clinicId);
        $fileFolder = "data/clinics/$fileClinicFolder/$dataModule->archiveFolder";
        $fileFinished = "$fileFolder/$imageData->name.$imageData->extension";
        if (file_exists($fileFinished)) {
            if (!unlink($fileFinished))
                dieJson(500, 'WAU-0122');
        }

        //:Deleta thumbnail na pasta
        if (\in_array($imageData->extension, ['jpg', 'png'])) {
            $fileClinicFolder = padWithZeros($this->clinicId);
            $thumbFile = $fileFolder . "/" . $imageData->name . "_t." . $imageData->extension;
            if (file_exists($thumbFile)) {
                if (!unlink($thumbFile))
                    dieJson(500, 'WAU-0124');
            }
        }

        //:Deleta documento na tabela
        $dataModule->modImage
            ->where('id', $imageId)
            ->delete();

        $this->getData();
    }

    //:RETORNA VALORES DAS VARIÁVEIS DO MÓDULO
    public function dataModule($imgMethod)
    {
        //:Define variáveis do módulo
        $targetMethod = "data_$imgMethod";
        return DataModule::$targetMethod();
    }
}
