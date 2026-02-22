<?php

namespace App\Libraries\Whatsapp;

use App\Libraries\Whatsapp\WhatsappMain;

class ZapGetContactPicture
{
    private $main;

    public function __construct()
    {
        $this->main = new WhatsappMain();
    }

    public function getContactPicture($instance, $phone)
    {
        //:VALIDA TELEFONE
        $phone = $this->main->get_phone($phone);

        //:CURL
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $this->main->get_url($instance) . "profile-picture?phone={$phone}",
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                "Client-Token: F6ae8c6d797354f188681bcef1c01cb10S",
                "Content-Type: application/json",
            ],
        ]);

        //:RESPOSTA
        $resp = json_decode(curl_exec($curl));
        $err = json_decode(curl_error($curl));

        //:FECHA CURL
        curl_close($curl);

        //:SE TEVE ERRO EM CURL
        if ($err) {
            dieJson(200, "cURL Error #: {$err}");
        }
        ;

        //:SE RETORNOU ERRO EM RESPOSTA
        if (isset($resp->error)) {
            dieJson(200, $resp->error);
        }
        ;

        //:SE IMAGEM NÃO FOI LOCALIZADA
        if ($resp->link == 'null') {
            $resp->link = base_url('img/zapOff.jpg');
        }
        ;

        //:RETORNA
        return $resp;
    }
}
