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

        //:Cria session com id da clínica matriz
        session()->set('clinicMainId', $response->id_clinicMain);

        $dv = uniqid(); //.dv = data version
        $phone = preg_replace('/(\d{2})(\d{5})(\d{4})/', '$1 $2-$3', $response->phone);
        $data = [
            'refresh' => $dv,
            'logo' => base_url("dataSistem/images/logos/wau/wau300x117_1.webp?v=$dv"),
            'signupName' => $response->name,
            'signupPhone' => $phone,
            'signupEmail' => $response->email,
            'signupPayPhone' => $phone,
            'signupPayEmail' => $response->email,
        ];

        echo view('adm/register/signUp.html', $data);
    }

    //:SEND - Recebe os dados do formulário de cadastro
    public function send(): void
    {
        $request = $this->request;

        $userData     = json_decode($request->getPost('userData'));
        $clinicData   = json_decode($request->getPost('clinicData'));
        $passwordData = json_decode($request->getPost('passwordData'));
        $payData      = json_decode($request->getPost('payData'));

        //:Adiciona id da clínica matriz
        $clinicData->id_clinicMain = session()->clinicMainId;

        //:BUSCA DADOS DO LEAD VIA CURL
        $isLocalhost = strpos(base_url(), 'localhost') !== false;
        $url = $isLocalhost
            ? 'http://localhost/wausaude/public/api/wauClinic/receiveLead/setRegister'
            : 'https://wausaude.com.br/api/wauClinic/receiveLead/setRegister';

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST            => true,
            CURLOPT_RETURNTRANSFER  => true,
            CURLOPT_SSL_VERIFYPEER  => false,
            CURLOPT_TIMEOUT         => 30,
            CURLOPT_HTTPHEADER      => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS      => json_encode([
                'userData'      => $userData,
                'clinicData'    => $clinicData,
                'passwordData'  => $passwordData,
                'payData'       => $payData,
            ]),
        ]);

        $responseJson = curl_exec($ch);
        $httpCode     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $this->response->setJSON(json_decode($responseJson))->send();
    }
}
