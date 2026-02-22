<?php

namespace App\Controllers\Archive\Libraries;

use App\Models\Archive\ArchiveDocument_Model;
use App\Models\Archive\ArchiveExam_Model;
use App\Models\Archive\ArchivePhoto_Model;

class DataModule
{
    private static function base(
        string $method,
        string $folder,
        string $permGet,
        string $permSave,
        string $permDelMy,
        string $permDelClinic,
        $model
    ) {
        return (object) [
            'method'        => $method,
            'archiveFolder' => $folder,
            'permGetData'   => $permGet,
            'permSave'      => $permSave,
            'permDelMy'     => $permDelMy,
            'permDelClinic' => $permDelClinic,
            'modImage'      => $model,
        ];
    }

    public static function data_document()
    {
        return self::base(
            'document',
            'patientDocument',
            '159P',
            '160P',
            '13P',
            '57P',
            new ArchiveDocument_Model()
        );
    }

    public static function data_exam()
    {
        return self::base(
            'exam',
            'patientExam',
            '102P',
            '75P',
            '70P',
            '101P',
            new ArchiveExam_Model()
        );
    }

    public static function data_photo()
    {
        return self::base(
            'photo',
            'patientPhoto',
            '107P',
            '110P',
            '111P',
            '119P',
            new ArchivePhoto_Model()
        );
    }
}
