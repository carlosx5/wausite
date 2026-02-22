<?php

namespace App\Libraries\Whatsapp;

use App\Libraries\Whatsapp\WhatsappMain;

class ZapSendText
{
    private $main;

    public function __construct()
    {
        $this->main = new WhatsappMain();
    }

    /**
     * @param mixed $instance
     * @param mixed $phone
     * @param mixed $message
     * @return mixed
     */
    public function sendText($instance, $phone, $message)
    {
        //*VALIDA TELEFONE
        $phone = $this->main->get_phone($phone);

        //*CURL
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $this->main->get_url($instance) . "send-text",
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER => [
                "Client-Token: F6ae8c6d797354f188681bcef1c01cb10S",
                "Content-Type: application/json",
            ],
            CURLOPT_POSTFIELDS => json_encode([
                "phone" => $phone,
                "message" => $message,
                "delayTyping" => 3,
            ]),
        ]);

        //*RESPOSTA
        $resp = json_decode(curl_exec($curl));
        $err = json_decode(curl_error($curl));

        //*FECHA CURL
        curl_close($curl);

        //*SE TEVE ERRO EM CURL
        if ($err) {
            dieJson(200, "cURL Error #: {$err}");
        }

        //*SE RETORNOU ERRO EM RESPOSTA
        if (isset($resp->error)) {
            dieJson(200, $resp->error);
        }

        //*RETORNA
        return $resp;
    }
}
