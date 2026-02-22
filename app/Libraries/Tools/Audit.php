<?php

namespace App\Libraries\Tools;

use App\Libraries\Whatsapp\ZapSendText;

class Audit
{
    private $modZapText;

    public function __construct()
    {
        $this->modZapText = new ZapSendText();
    }

    public function sendCarlosZap($message = 'sem mensagem!')
    {
        $phoneList = '5511989497692,5511952090858,5511950524119,5511957971553';
        $phoneArray = strArray($phoneList, false);

        foreach ($phoneArray as $phone) {
            $resp = $this->modZapText->sendText('sistema', $phone, $message);
        }

        return $resp;
    }
}
