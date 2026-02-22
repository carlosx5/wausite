<?php

namespace App\Controllers\Api\Autentique;

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Content-Type");

use CodeIgniter\Controller;
use App\Models\Record\Register\RecordRegister_Model;

class Webhook extends Controller
{
    public function __construct()
    {
        date_default_timezone_set('America/Sao_Paulo');
    }

    public function rest()
    {
        //:DATA
        $dataPost = $this->request->getVar();

        //:Chega se é um debug
        $debug = empty($dataPost->debug) ? null : true;

        //:Se for um debug pega os dados de debug
        $dataPost = $debug ? $dataPost->debug : $dataPost;

        // $idUnico = uniqid('autentique_', true);
        // arquiva($dataPost, $idUnico);

        $type = $dataPost->event->type;
        $id = $dataPost->event->data->id;

        if ($type === 'document.finished') {
            $modRecord = new RecordRegister_Model();

            $resp = $modRecord
                ->protect(false)
                ->set('signature_status', 2, false)
                ->where('id_autentique', $id)
                ->update();

            // $dataDegub = [
            //     'type' => $type,
            //     'id' => $id,
            //     'resp' => $resp,
            // ];

            // $idUnico = uniqid('resp_', true);
            // arquiva($dataDegub, $idUnico);

            dieJson(200, $resp);
        }
    }
}
