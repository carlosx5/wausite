<?php

namespace App\Controllers\Tools\Message;

use App\Controllers\BaseController;

class Zap extends BaseController
{
    public function send_text()
    {
        $this->initFetch(9);

        $phone = $this->request->getVar('phone');
        $message = $this->request->getVar('message');

        $zap = new \App\Libraries\Whatsapp();
        validate($zap->checkConnected(), '*WhatsApp desconectado!');
        $resp = $zap->sendText($phone, $message);

        return $this->json(200, $resp);
    }

    public function teste()
    {
        $zap = new \App\Libraries\Whatsapp();
        validate($zap->checkConnected(), '*WhatsApp desconectado!');
        $resp = $zap->teste();

        return $this->json(200, $resp);
    }
}
