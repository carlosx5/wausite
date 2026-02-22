<?php

namespace App\Libraries\Whatsapp;

use App\Libraries\Whatsapp\WhatsappMain;

class ZapGetQrCode
{
    private $main;

    public function __construct()
    {
        $this->main = new WhatsappMain();
    }

    /** //-BUSTA QRCODE PARA CONECÇÃO DE INSTANCIA
     * @param string $instance
     */
    public function getQrCode($instance)
    {
        //:CURL
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $this->main->get_url($instance) . "qr-code/image",
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

        //:SE RETORNOU ERRO EM RESPOSTA
        if (isset($resp->error)) {
            dieJson(200, $resp->error);
        }

        //:RETORNA
        return $resp;
    }
}
