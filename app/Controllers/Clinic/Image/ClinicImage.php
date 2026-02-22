<?php

namespace App\Controllers\Clinic\Image;

use App\Controllers\FetchController;
use App\Models\Clinic\ClinicRegister_Model;

class ClinicImage extends FetchController
{
    private $modClinic;

    public function __construct()
    {
        $this->modClinic = new ClinicRegister_Model();
    }

    //:RETORNA REQUEST DE DADOS DA CLÍNICA
    public function getData($clinicId = null)
    {
        parent::initFetch('55P', false);

        $clinicId ??= $this->request->getVar("clinicId");
        $returnData = [];

        //:Busca "clinica"
        $clinicData = $this->getClinic($clinicId);

        //:Url completo da imagem
        $imageUrl = $this->getImageLogoUrl($clinicId);

        $returnData['clinic'] = $clinicData;

        //:Retorna dados da imagem
        $returnData['image'] = [
            'url' => $imageUrl,
        ];

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

    //:RETORNA URL COMPLETA DA IMAGEM
    private function getImageLogoUrl($clinicId, $withRefresh = true)
    {
        $clinicId = padWithZeros($clinicId); //:Id da clínica com 11 digitos

        $refresh = $withRefresh ? "?v=$this->refresh" : ''; //:Adiciona refresh se for true
        $result = "data/clinics/$clinicId/logo/logo.png$refresh"; //:Caminho da pasta  

        return $result;
    }

    //:SALVA IMAGEM
    public function setData()
    {
        $optLock = parent::initFetch('55P', true);

        $clinicId = $this->request->getVar('clinicId');

        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['image']))
            dieJson(400, 'Imagem não enviada');

        if (empty($data['clinicId']))
            dieJson(400, 'Id da clínica não enviada');

        $image = $data['image'];
        $clinicId = $data['clinicId'];

        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $origType = strtolower($type[1]);
            if (in_array($origType, ['jpg', 'jpeg', 'png']))
                dieJson(400, 'Tipo de imagem inválido');

            $imageData = substr($image, strpos($image, ',') + 1);
            $imageData = base64_decode($imageData);

            if ($imageData === false)
                dieJson(400, 'Erro ao decodificar imagem');

            //:Cria resource GD a partir do conteúdo binário
            $srcImg = imagecreatefromstring($imageData);
            if (!$srcImg)
                dieJson(400, 'Erro ao processar imagem');

            $origWidth = imagesx($srcImg);
            $origHeight = imagesy($srcImg);

            $maxWidth = 600;
            $newWidth = $origWidth;
            $newHeight = $origHeight;

            if ($origWidth > $maxWidth) {
                $ratio = $maxWidth / $origWidth;
                $newWidth = $maxWidth;
                $newHeight = intval($origHeight * $ratio);
            }

            //:Cria novo resource redimensionado
            $dstImg = imagecreatetruecolor($newWidth, $newHeight);

            //:Trata transparência (sempre salva em PNG)
            imagealphablending($dstImg, false);
            imagesavealpha($dstImg, true);
            $transparent = imagecolorallocatealpha($dstImg, 0, 0, 0, 127);
            imagefill($dstImg, 0, 0, $transparent);

            //:Redimensiona
            imagecopyresampled($dstImg, $srcImg, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

            //:Monta path
            $clinicId = padWithZeros($clinicId);
            $folder = FCPATH . "data/clinics/$clinicId/logo/";
            if (!is_dir($folder))
                mkdir($folder, 0755, true);
            $filename = "logo.png";
            $path = "$folder/$filename";

            //:Salva em PNG
            $saved = imagepng($dstImg, $path, 8);

            //:Limpa memória
            imagedestroy($srcImg);
            imagedestroy($dstImg);

            //:Se imagem foi salva, retorna dados
            if ($saved)
                return $this->getData($clinicId);


            dieJson(400, 'Erro ao salvar arquivo');
        } else {
            dieJson(400, 'Formato inválido');
        }
    }

    //:DELETA IMAGEM
    public function deleteLogo()
    {
        $optLock = parent::initFetch('55P', true);

        $clinicId = $this->request->getVar("clinicId");

        $path = FCPATH . $this->getImageLogoUrl($sessionValues->clinicId, false);

        if (is_file($path)) {
            //:A imagem existe, deletar
            if (unlink($path)) {
                //:Retorna dados da imagem
                $imageUrl = $this->getImageLogoUrl($sessionValues->clinicId);
                //:Retorna dados de imagem
                $returnData['image'] = [
                    'url' => $imageUrl,
                ];

                //:Retorna valores para Local Storage
                $returnData['localStorage'] = [
                    'clinicId' => $sessionValues->clinicId,
                    'clinicName' => $sessionValues->clinicName,
                ];

                dieJson(200, $returnData);
            } else {
                dieJson(200, "Falha ao deletar a imagem.");
            }
        } else {
            //:A imagem não existe
            dieJson(200, "A imagem não existe.");
        }
    }
}
