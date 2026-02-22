<?php

namespace App\Libraries\Whatsapp;

class WhatsappMain
{
    private $idInstances = '';
    private $idToken = '';
    public $logo = '';
    public $title = '';

    /**
     * Método para gerar url
     */
    public function get_url($instance)
    {
        switch ($instance) {
            case 'recepcao':
                $this->clientToken = 'F6ae8c6d797354f188681bcef1c01cb10S';
                $this->idInstances = '3B82E7E51F51E0AEF903D210EF4E88BB';
                $this->idToken = 'D736EC9E7F0DB54AACFEDAC4';
                $this->logo = "https://arcapp.com.br/img/logos/arc/arc_zap_01.jpg";
                $this->title = "Instituto Arc";
                break;

            case 'sistema':
                $this->clientToken = 'F6ae8c6d797354f188681bcef1c01cb10S';
                $this->idInstances = '3CC2C6573259700D90CE328F4AB9CB8C';
                $this->idToken = '8E4C39AD444923D9C5423410';
                $this->logo = "https://arcapp.com.br/img/logos/arc/arc_zap_01.jpg";
                $this->title = "Arc TI";
                break;

            default:
                break;
        }

        return "https://api.z-api.io/instances/{$this->idInstances}/token/{$this->idToken}/";
    }

    /**
     * Método para preparar telefone
     */
    public function get_phone($phone)
    {
        return str_replace(array('-', ' '), '', $phone);
    }

    /**
     * Método para checar conexão
     */
    public function checkConnected($instance)
    {
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $this->get_url($instance) . 'status',
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                "Client-Token: F6ae8c6d797354f188681bcef1c01cb10S",
                "Content-Type: application/json"
            ],
        ]);
        $resp = json_decode(curl_exec($curl));
        curl_close($curl);

        return $resp->connected;
    }
}
