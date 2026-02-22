<?php

namespace App\Libraries\ZapGti;

use App\Libraries\ZapGti\SendCurl;

class SendText
{
    /**
     * Envia mensagem de texto
     * @param string $instanceName Numero usado para envio
     * @param string $number Numero destino
     * @param string $text Texto para envio
     */
    public static function render($instanceName, $number, $text)
    {
        $url = 'message/sendText';

        //:Validação
        if (empty($number) || empty($text)) {
            $number = "5511989497692";
            $text = "Estão tentando enviar mensagem sem informar número ou texto.";
        }

        //:Body
        $body = [
            "number"    => $number,
            "text"      => $text
        ];

        return SendCurl::send($instanceName, $url, $body);
    }
}
