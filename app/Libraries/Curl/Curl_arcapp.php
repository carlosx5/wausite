<?php

namespace App\Libraries\Curl;

class Curl_arcapp
{
    /**
     * @var $autoLocal = true|false
     */
    public function send($uri, $body, $autoLocal = true)
    {
        //URL
        $isLocal = ($_SERVER['HTTP_HOST'] == 'localhost');
        if($autoLocal) {
            $url = $isLocal ? 'http://localhost/arcapp/public' : 'https://arcapp.com.br';
        } else {
            $url = 'https://arcapp.com.br';
        };
        $url = $url . '/' . $uri;

        //CURL
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                "token: " . TOKEN,
            ],
            CURLOPT_POSTFIELDS => $body,
        ]);
        $resp = json_decode(curl_exec($curl), true);
        curl_close($curl);

        return $resp;
    }
}
