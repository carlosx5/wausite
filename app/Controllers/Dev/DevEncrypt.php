<?php

namespace App\Controllers\Dev;

use App\Controllers\BaseController;

class DevEncrypt extends BaseController
{
    public function __construct() {}

    public function get()
    {
        $data['template'] = view("dev/encryptModal.html");

        dieJson(200, $data);
    }

    public function refresh()
    {
        $encodeIn = $this->request->getVar('encodeIn');
        $decodeIn = $this->request->getVar('decodeIn');

        $data['encodeOut'] = base64url_encode($encodeIn);
        $data['decodeOut'] = base64url_decode($decodeIn);

        $data['encodeCheck'] = base64url_decode($data['encodeOut']);
        $data['decodeCheck'] = base64url_encode($data['decodeOut']);

        dieJson(200, $data);
    }
}
