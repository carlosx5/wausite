<?php

namespace App\Libraries\Marketing;

class MarketingLib
{
    public function encode($id)
    {
        $caracteres = "ABCDEFGHIJKLMNOPQRSTUVXYWZ";
        $quantidade =  7 - strlen($id);
        $letter = '';
        for ($i = 0; $i < $quantidade; $i++) {
            $letter .= substr($caracteres, rand(0, strlen($caracteres) - 1), 1);
        };

        return rtrim(strtr(base64_encode($letter . $id), '+/', '-_'), '=');
        // return base64_encode($letter . $id);
    }

    public function decode($id)
    {
        return preg_replace('/[^0-9]/', '', base64_decode($id));
    }
}
