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
        $data = [
            'name'     => $this->request->getPost('name'),
            'phone'    => $this->request->getPost('phone'),
            'email'    => $this->request->getPost('email'),
            'isMobile' => $this->request->getPost('isMobile'),
        ];

        $url = ($_SERVER['HTTP_HOST'] === 'localhost')
            ? 'http://localhost/wausaude/public/'
            : 'https://wausaude.com.br/';

        $ch = curl_init($url . 'api/wauClinic/receiveLead/receive');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($data),
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => false,
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
