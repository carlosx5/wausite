<?php

namespace App\Libraries\Whatsapp;

use App\Libraries\Whatsapp\WhatsappMain;

class ZapSendButton
{
    private $main;

    public function __construct()
    {
        $this->main = new WhatsappMain();
    }

    /**
     * Método para enviar link
     * @param string $instance
     * @param string $phone
     * @param string $message
     * @param array $buttonList
     */
    public function sendButton($instance, $phone, $message, $buttonList)
    {
        //*VALIDA TELEFONE
        $phone = $this->main->get_phone($phone);

        //*CURL
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $this->main->get_url($instance) . "send-button-list",
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
                "buttonList" => [
                    "buttons" => $buttonList,
                ],
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
