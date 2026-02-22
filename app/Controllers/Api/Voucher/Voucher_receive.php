<?php

namespace App\Controllers\Api\Voucher;

use App\Controllers\UnloggedController;
use App\Models\Voucher\Voucher_Model;
use App\Models\Procedure\Procedure_Model;

class Voucher_receive extends UnloggedController
{
    /**
     * Método de tela
     */
    public function index($voucherNo)
    {
        helper(['mask', 'validate']);

        $modVoucher = new Voucher_Model();
        $modProcedure = new Procedure_Model();
        $parser = service('parser');

        $voucher = $modVoucher->find($voucherNo);
        validate($voucher);

        $procedure = $modProcedure->find($voucher->id_procedure);
        validate($procedure);

        $timestamp = strtotime(date('Y-m-d H:i:s'));
        $voucherNo = mask($voucherNo, '####.####.####');

        //DATA
        $data = $this->dataCreate(
            'api/voucher/voucher_receive,p-carousel',
            'api/voucher/voucher_receive,p-bootstrap.min',
        );
        //
        $data['img1'] = base_url("data/voucher/{$procedure->img_1}.jpg?r={$timestamp}");
        $data['img2'] = base_url("data/voucher/{$procedure->img_2}.jpg?r={$timestamp}");
        $data['img3'] = base_url("data/voucher/{$procedure->img_3}.jpg?r={$timestamp}");
        //
        $data['procedure'] = $procedure->voucher_description;
        //
        $data['voucherNo'] = $voucherNo;
        $data['voucherName'] = $voucher->name;
        $data['dtExpires'] = date('d/m/Y', strtotime($voucher->dt_expires));
        $data['value1'] = 'R$ ' . val_br($voucher->vl_table);
        $data['value2'] = 'R$ ' . val_br($voucher->vl_discount);
        $data['value3'] = 'R$ ' . val_br($voucher->vl_total);

        viewShow('api/voucher/voucher_receive', $data, true, false);
    }

    /**
     * Método para solicitar agendamento
     */
    public function schedule()
    {
        helper('validate');

        $modVoucher = new Voucher_Model();
        $modProcedure = new Procedure_Model();
        $modUser = new \App\Models\User\User_register_Model();
        //
        $zap = new \App\Libraries\Whatsapp();
        validate($zap->checkConnected(), '*WhatsApp desconectado!');

        $voucherIdMask = $this->request->getPost('voucherId');
        $voucherId = str_replace(array('.'), "", $voucherIdMask);

        //BUSCA VOUCHER
        $voucher = $modVoucher->find($voucherId);
        if (!$voucher) {
            $zap->sendAlert("Tentativa de acesso em voucher com id inválido: {$voucherId}");
            return $this->response->setJSON(['status' => 455]);
        }
        ;

        //BUSCA PROCEDIMENTO
        $procedure = $modProcedure->select('name')->find($voucher->id_procedure);

        //BUSCA USUÁRIO
        $user = $modUser->select('name_short')->find($voucher->id_user);

        //ENVIA CONVITE POR ZAP
        $cel = '5511952070276';
        // $cel = '5511989497692';//TESTE
        $url = "https://arcapp.com.br";
        $message = "Voucher: {$voucherIdMask}\nNome: {$voucher->name}\nCelular: {$voucher->cel}\n";
        $message .= "Procedimento: {$procedure->name}\n\nUsuário: {$user->name_short}\n";
        $image = "https://arcapp.com.br/img/logos/arc/zap_alert1.jpg";
        $linkDescription = 'ATENDIMENTO';
        //
        $zap->sendLink($cel, $message, $url, $linkDescription, 0, $image);

        $data['status'] = 200;
        return $this->response->setJSON($data);
    }
}
