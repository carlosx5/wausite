<?php

namespace App\Controllers\Templates;

use App\Controllers\BaseController;

class Templates extends BaseController
{
    public function __construct()
    {
    }

    public function message_modal()
    {
        $template = view('templates/messages/message_modal.html');

        echo json_encode(['status' => 200, 'template' => $template]);die;
    }
}
