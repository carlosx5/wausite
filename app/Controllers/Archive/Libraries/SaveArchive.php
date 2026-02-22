<?php

namespace App\Controllers\Archive\Libraries;

use App\Libraries\Image\ResizeImage;

class SaveArchive
{
    public function render($patientId, $clinicId, $loginId, $fileTmp, $fileType, $archiveFolder, $modImage)
    {
        //:Checa extenção e normaliza jpeg → jpg
        if ($fileType === 'image/jpeg') {
            $fileExtension = 'jpg';
        } elseif ($fileType === 'image/png') {
            $fileExtension = 'png';
        } elseif ($fileType === 'application/pdf') {
            $fileExtension = 'pdf';
        } else {
            dieJson(400, 'WAU-0107');
        }

        //:Prepara diretórios e nomes
        $fileClinicFolder = padWithZeros($clinicId);
        $fileFolder = "data/clinics/$fileClinicFolder/$archiveFolder";

        $libResizeImage = new resizeImage();

        //:Cria pasta se não existir
        if (!is_dir($fileFolder))
            mkdir($fileFolder, 0755, true);

        //:Salva documento
        $modImage
            ->protect(false)
            ->save([
                'id_patient'    => $patientId,
                'id_clinic'     => $clinicId,
                'id_login'      => $loginId,
                'extension'     => $fileExtension,
                'date'          => date('Y-m-d'),
            ]);

        //:Atualiza o campo 'name' com o ID obtido
        $newId = $modImage->getInsertID();
        $fileName = "{$newId}_" . uniqid();
        $modImage->update($newId, ['name' => $fileName]);

        //:Salva documento fisico
        $filePath = "$fileFolder/$fileName.$fileExtension";
        $resp = move_uploaded_file($fileTmp, $filePath);

        //:Se for imagem redimensiona p/ maximo de 600px
        if ($resp && \in_array($fileExtension, ['jpg', 'png'])) {
            $libResizeImage->render($filePath, 600);
        }

        //:Se for imagem redimensiona p/ maximo de 600px
        if ($resp && \in_array($fileExtension, ['jpg', 'png'])) {
            $thumbFile = $fileFolder . "/" . $fileName . "_t." . $fileExtension;
            copy($filePath, $thumbFile);
            $libResizeImage->render($thumbFile, 150);
        }

        return $resp;
    }
}
