<?php

namespace App\Libraries\Whatsapp;

use App\Libraries\Whatsapp\WhatsappMain;

class ZapSendLink
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
     * @param string $linkUrl
     * @param string $linkDescription
     * @param string $title
     * @param string $image
     */
    public function sendLink($params)
    {
        $params = (object) $params;

        $parInstance = $params->instance;
        $parPhone = $params->phone;
        $parMessage = $params->message;
        $parImage = $params->image ?? null;
        $parLinkUrl = $params->linkUrl ?? "https://institutoarc.com.br";
        $parTitle = $params->title ?? "Instituto.arc";
        $parLinkDescription = $params->linkDescription ?? null;

        //CHECA CONEXÃO
        if ($this->main->checkConnected($parInstance) !== true) {
            return false;
        }

        $modWhatsapp = new \App\Models\Whatsapp\Message\ZapMessage_Model();

        $parPhone = str_replace(array('-', ' '), '', $parPhone);
        $linkActive = $modWhatsapp->where('phone', $parPhone)->first();

        //MENSAGEM PARA ATIVAR O LINK
        if (!$linkActive) {
            $parMessage .= "\n\nDica p/ Whatsapp: Responda com um \"OK\" para o link ficar ativo.";
        }

        // $uri = 'send-text';
        $uri = 'send-link';
        $request = 'POST';
        $url = $this->main->get_url($parInstance) . $uri;
        $headers = [
            "Client-Token: F6ae8c6d797354f188681bcef1c01cb10S",
            "Content-Type: application/json"
        ];
        $post = json_encode([
            "phone" => $parPhone,
            "message" => $parMessage,
            "image" => $parImage ?? $this->main->logo,
            "linkUrl" => $parLinkUrl ?? '',
            "title" => $parTitle ?? $this->main->title,
            "linkDescription" => $parLinkDescription ?? '',
        ]);

        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_CUSTOMREQUEST => $request,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $post,
        ]);
        $resp = curl_exec($curl);
        curl_close($curl);

        return $resp;
    }
}
