<?php

namespace App\Controllers\Tools\Teste;

use App\Controllers\RestController;

class Rest extends RestController
{
    public function __construct()
    {
    }

    public function lista()
    {
        $this->permission_check(999);

        $testeGet = $this->request->getGet('teste');
        $testePost = $this->request->getPost('teste');
        $testeVar = $this->request->getVar('teste');

        $tarrayGet = $this->request->getGet('tarray');
        $tarrayPost = $this->request->getPost('tarray');
        $tarrayVar = $this->request->getVar('tarray');


        $data['status'] = 200;

        $data['testeGet']  = $testeGet;
        $data['testePost']  = $testePost;
        $data['testeVar']  = $testeVar;

        $data['tarrayGet']  = $tarrayGet;
        $data['tarrayPost']  = $tarrayPost;
        $data['tarrayVar']  = $tarrayVar;

        return $this->response->setJSON($data);
    }
}
