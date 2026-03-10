<?php

namespace App\Controllers\Adm\Register;

use App\Controllers\ViewController;

class SignUp extends ViewController
{
    //:INDEX
    public function index($hash = null): void
    {
        //:VALIDA HASH
        if (!$hash) {
            die('Link inválido.');
        }

        //:BUSCA DADOS DO LEAD VIA CURL
        $isLocalhost = strpos(base_url(), 'localhost') !== false;
        $url = $isLocalhost
            ? 'http://localhost/wausaude/public/api/wauClinic/receiveLead/getLeadData'
            : 'https://wausaude.com.br/api/wauClinic/receiveLead/getLeadData';

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => json_encode(['hash' => $hash]),
        ]);

        $response = json_decode(curl_exec($ch));
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error    = curl_error($ch);
        curl_close($ch);

        $dv = uniqid(); //.dv = data version
        $data = [
            'refresh' => $dv,
            'logo' => base_url("dataSistem/images/logos/wau/wau300x117_1.webp?v=$dv"),
            'signupName' => $response->name,
            'signupPhone' => preg_replace('/(\d{2})(\d{5})(\d{4})/', '$1 $2-$3', $response->phone),
            'signupEmail' => $response->email,
        ];

        echo view('adm/register/signUp.html', $data);
    }
}
