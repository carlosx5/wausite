<?php

namespace App\Controllers\Api\Voucher;

use App\Controllers\BaseController;
use App\Models\Voucher\Voucher_Model;
use App\Models\Procedure\Procedure_Model;

class Voucher_send extends BaseController
{
    public function __construct()
    {
        $this->modProcedure = new Procedure_Model();
    }

    /**
     * Método de tela
     */
    public function index()
    {
        $uri = $this->initBackend(154);

        helper('mask');

        $modVoucher = new Voucher_Model();

        //DATA
        $data = $this->dataCreate(
            'api/voucher/voucher_send',
            'api/voucher/voucher_send',
            true,
        );
        $data['procedure'] = $this->modProcedure
            ->select('id, name')
            ->where('vl_table > 1')
            ->where('voucher_description > ""')
            ->where('img_1 > ""')
            ->where('img_2 > ""')
            ->where('img_3 > ""')
            ->where('id_clinic', session()->clinic['id'])
            ->findAll();
        //
        $data['screenSize'] = $_COOKIE['screenSize'];

        return (viewShow('api/voucher/voucher_send', $data, true));
    }

    /**
     * Método de enviar voucher
     */
    public function send()
    {
        $this->initFetch('154P');
        helper('validate');

        $modVoucher = new Voucher_Model();
        //
        $zap = new \App\Libraries\Whatsapp();
        validate($zap->checkConnected(), '*WhatsApp desconectado!');

        $get = $this->request->getVar('data');

        //DATA
        $data = (object) array();
        $data->id = str_replace(array('.'), "", $get->voucherId);
        $data->id_user = session()->log_userId;
        $data->id_procedure = $get->procedureId;
        $data->name = $get->name;
        $data->cel = $get->cel;
        //
        $data->vl_table = mask_val_1($get->vl_table);
        $data->vl_discount = mask_val_1($get->vl_discount);
        $data->vl_total = mask_val_1($get->vl_total);
        //
        $data->dt_expires = date('Y-m-d', strtotime('+1 month'));

        //VALIDAÇÃO
        validate($data->name, 'nome');
        validate($data->cel, 'celular', 'cel');
        validate($data->id_procedure, 'procedimento');

        //SALVA VOUCHER
        $resp = $modVoucher->protect(false)->insert($data);

        //ENVIA CONVITE POR ZAP
        $cel = '55' . $data->cel;
        $url = "https://arcapp.com.br/voucher/{$data->id}";
        $message = "Você ganhou um voucher do Instituto.arc.\nClique no link para agendar seu voucher: {$url}";
        $image = "https://arcapp.com.br/img/logos/arc/zap_alert1.jpg";
        $linkDescription = 'Link de Voucher';
        //
        $zap->sendLink($cel, $message, $url, $linkDescription);

        return $this->json(200);
    }

    /**
     * Método para buscar dados do procedimento
     */
    public function getProcedure()
    {
        $procedureId = $this->initFetch('154P', 'procedureId');

        $data['procedure'] = $this->modProcedure->select('vl_table')->find($procedureId);

        return $this->json(200, $data);
    }
}
