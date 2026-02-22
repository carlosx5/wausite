<?php

namespace App\Controllers\Archive\Libraries;

class Key
{
    public static function encodeQrKey($patientId, string $method, int $limitTime)
    {
        helper('encode');

        $key = '';
        $key .= strtotime('-20 years'); //:###
        $key .= '&' . $patientId; //:Id paciente
        $key .= '&' . session('clinic')['id']; //:Id clinica
        $key .= '&' . session()->log_userId; //:Id login
        $key .= '&' . time(); //:Timestamp
        $key .= '&' . $limitTime; //:Tempo limite em minutos
        $key .= '&' . $method; //:Método (document, exam, photo, etc...)
        $key .= '&' . strtotime('-12 years'); //:###

        return base64url_encode($key); //:Retorna key criptografada
    }
}
