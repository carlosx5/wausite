<?php

namespace App\Controllers\Api\Gti;

use CodeIgniter\Controller;
use CodeIgniter\API\ResponseTrait;

class Webhook extends Controller
{
    use ResponseTrait;

    public function send_message()
    {
        $data = $this->request->getJSON(true);
        arquiva($data, "Webhook_sent");
    }

    public function messages_upsert()
    {
        $data = $this->request->getJSON(true);
        arquiva($data, "Webhook_upsert");
    }
}
