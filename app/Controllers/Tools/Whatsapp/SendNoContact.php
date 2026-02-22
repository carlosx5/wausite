<?php

namespace App\Controllers\Tools\Whatsapp;

use App\Controllers\BaseController;
use App\Libraries\Whatsapp\Whatsapp;
use App\Libraries\Curl\Curl_arcapp;

class SendNoContact extends BaseController
{
    public function __construct()
    {
        $this->modZap = new Whatsapp();
        $this->curl = new Curl_arcapp();
    }

    public function index()
    {
        $this->initBackend(9);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Marketing',
            'viewTitle' => 'Leads',
            'contenList' => ['marketing/lead/report'],
        ]);

        $data = $this->dataCreate(
            'tools/whatsapp/sendNoContact',
            'tools/whatsapp/sendNoContact'
        );

        return (viewShow('tools/whatsapp/sendNoContact', $data, false, false));
    }

    public function sendZap()
    {
        $this->initFetch(153);
        helper('validate');

        $zap = new Whatsapp();
        $zapInstance = 'sistema';
        validate($zap->checkConnected($zapInstance), '*WhatsApp desconectado!');

        $message = $this->request->getVar('message');
        $cell = $this->request->getVar('cell');

        //ENVIA MENSAGEM POR ZAP
        $cel = '55' . $cell;
        $url = "https://institutoarc.com.br";
        //
        $linkDescription = 'Teste';
        // $message = "teste de mensagem";
        //
        $resp = $zap->sendLink([
            'instance' => $zapInstance,
            'phone' => $cel,
            'message' => $message,
            'linkDescription' => $linkDescription,
        ]);

        return $this->json(200);
    }
}
