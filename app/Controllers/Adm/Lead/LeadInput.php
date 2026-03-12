<?php

namespace App\Controllers\Adm\Lead;

use App\Controllers\ViewController;

class LeadInput extends ViewController
{
    //:INDEX
    public function index(): void
    {
        $dv = uniqid(); //.dv = data version
        $data["refresh"] = $dv;
        $data['logo'] = base_url("dataSistem/images/logos/wau/wau300x117_1.webp?v=$dv");

        echo view('adm/lead/leadInput.html', $data);
    }

    //:ENVIA LEAD VIA CURL
    public function send()
    {
        $url = ($_SERVER['HTTP_HOST'] === 'localhost')
            ? 'http://localhost/wausaude/public/'
            : 'https://wausaude.com.br/';

        $data = [
            'name'          => $this->request->getPost('name'),
            'phone'         => $this->request->getPost('phone'),
            'email'         => $this->request->getPost('email'),
            'isMobile'      => $this->request->getPost('isMobile'),
            'clinicMainId'  => "0",
            'isLocalhost'   => $_SERVER['HTTP_HOST'] === 'localhost' ? 1 : 0,
        ];

        $ch = curl_init($url . 'api/wauClinic/receiveLead/receive');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => json_encode($data),
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error    = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return $this->response->setJSON(['success' => false, 'message' => 'Erro ao enviar: ' . $error]);
        }

        return $this->response->setStatusCode($httpCode)->setJSON(json_decode($response, true) ?? ['success' => true]);
    }
}
