<?php

namespace App\Controllers\Tools\Webhook;

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Content-Type");

use CodeIgniter\Controller;

class WebhookTeste extends Controller
{
    public function __construct()
    {
        $this->update();
    }

    public function update()
    {
        db_connect()->table('webhook_teste')->insert([
            'txt' => 'Ok',
        ]);

        $txt = 'Teste Ok';
        $fp = fopen($_SERVER['DOCUMENT_ROOT'] . "/webteste.json", "wb");
        fwrite($fp, $txt);
        fclose($fp);
        die;
    }
}


// $txt = 'Teste ok!';
// $fp = fopen("webhookTeste.txt", "a+");
// fwrite($fp, $txt);
// fclose($fp);
