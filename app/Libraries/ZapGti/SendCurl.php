<?php

namespace App\Libraries\ZapGti;

use App\Models\Whatsapp\ZapInstance_Model;

class SendCurl
{
    public static function send(string $instanceName, string $url, array $body)
    {
        $instance = new ZapInstance_Model();
        $instance = $instance->where('id', $instanceName)->first();

        if (!$instance)
            dieJson(400, 'Instância não encontrada -> WAU-0163');

        //:Remove qualquer caractere que não seja número
        $body['number'] = preg_replace('/\D/', '', $body['number']);

        $url = "https://apivip.gti-api.com/$url/$instance->id";

        $body = json_encode($body);

        //:Inicializa o cURL
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                "apikey: $instance->key"
            ],
            CURLOPT_POSTFIELDS => $body,
        ]);

        //:Respostas
        $resp = json_decode(curl_exec($ch));
        $err = json_decode(curl_error($ch));

        curl_close($ch);

        //:Se deu erro em CURL
        if ($err) {
            return ("cURL Error #: {$err}");
        }

        return $resp;
    }
}
