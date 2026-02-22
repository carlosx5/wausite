<?php

namespace App\Controllers\Api\Image;

use CodeIgniter\RESTful\ResourceController;
use App\Controllers\Archive\Libraries\SaveArchive;
use App\Controllers\Archive\Libraries\DataModule;
use App\Models\Archive\ArchiveDocument_Model;


class SetImage extends ResourceController
{
    private $modDocument;

    public function __construct()
    {
        $this->modDocument = new ArchiveDocument_Model();
    }

    public function index($key = null)
    {
        helper('encode');

        //:Key para subir imagens com QRCode "### + patientId + clinicId + loginId + timestamp + method + ###"
        $key = base64url_decode($key);
        $key = explode('&', $key);
        $timestamp = $key[4];
        $limitTime = (int) $key[5];
        $method = $key[6];

        session()->set([
            'documentInput' => [
                'patientId' => $key[1],
                'clinicId'  => $key[2],
                'loginId'   => $key[3],
                'timestamp' => $timestamp,
                'limitTime' => $limitTime,
                'method'    => $method,
            ],
        ]);

        //:Valida tempo
        $timeIsOk = $this->timerValidate($timestamp, $limitTime);
        if (!$timeIsOk) {
            echo view('api/image/timeout.html');
            return;
        }

        echo view('api/image/setImage.html');
    }

    //:SALVA DOCUMENTO
    public function setImage()
    {
        $patientId  = (int) session('documentInput')['patientId'];
        $clinicId   = (int) session('documentInput')['clinicId'];
        $loginId    = (int) session('documentInput')['loginId'];
        $timestamp  = (int) session('documentInput')['timestamp'];
        $limitTime  = (int) session('documentInput')['limitTime'];
        $method     = (string) session('documentInput')['method'];

        //:Retorna variáveis do módulo
        $dataModule = $this->dataModule($method);

        //:Valida tempo
        $timeIsOk = $this->timerValidate($timestamp, $limitTime);
        if (!$timeIsOk)
            dieJson(800, 'WAU-0108');

        //:Verifica se veio algum arquivo
        if (!isset($_FILES['fotos']['tmp_name'][0]))
            dieJson(400, 'WAU-0109');

        //:Pega o arquivo
        $fileTmp = $_FILES['fotos']['tmp_name'][0];
        $fileType = $_FILES['fotos']['type'][0];

        //:Salva documento
        $libSaveArchive = new SaveArchive();
        $resp = $libSaveArchive->render(
            $patientId,
            $clinicId,
            $loginId,
            $fileTmp,
            $fileType,
            $dataModule->archiveFolder,
            $dataModule->modImage
        );

        dieJson(200, $resp ? 'Arquivo enviado' : 'Falha no upload');
    }

    //:VALIDA TEMPO
    public function timerValidate($timeUrl, $timeMax = 10)
    {
        $timeNow = time();
        $timeDifference = (int) (($timeNow - $timeUrl) / 60);
        $result = $timeDifference > $timeMax ? false : true;

        return $result;
    }

    //:RETORNA VALORES DAS VARIÁVEIS DO MÓDULO
    public function dataModule($imgMethod)
    {
        //:Define variáveis do módulo
        $targetMethod = "data_$imgMethod";
        return DataModule::$targetMethod();
    }
}
