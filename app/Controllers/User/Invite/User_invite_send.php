<?php

namespace App\Controllers\User\Invite;

use App\Controllers\BaseController;
use App\Controllers\User\Invite\User_invite_database;
use App\Models\User\User_register_Model;
use App\Models\User\Invite\Invite_link_Model;
use App\Libraries\Whatsapp\Whatsapp;

class user_invite_send extends BaseController
{
    public function index()
    {
        $this->initBackend([91, 93, 106, 137], 'SbMenuOn=Convites');

        $table = $this->request->getGet('table');
        $tableName = User_invite_database::table($table);

        //DATA
        $data = $this->dataCreate(
            'user/invite/user_invite_send',
            'factory/ajaxSelect,user/invite/user_invite_send'
        );
        $data['actingName'] = $tableName['name'];
        $data['logoLab'] = base_Url('/img/logos/arc/arc1_01.webp');
        $data['varJS']['acting'] = $tableName['id'];

        return (viewShow('user/invite/user_invite_send', $data, true));
    }

    public function sendInvite()
    {
        helper('validate');

        $data = $this->request->getVar('data');
        $access = User_invite_database::table($data->table)['access'];
        //
        $this->permission_check($access);

        $zap = new Whatsapp();
        $zapInstance = 'recepcao';
        validate($zap->checkConnected($zapInstance), '*WhatsApp desconectado!');

        //VALIDAÇÃO
        validate($data->name, 'nome');
        validate($data->cell, 'celular', 'cel');
        validate($data->id_clinic, 'clínica');

        //CHECA SE JÁ ESTÁ CADASTRADO
        $modUser = new User_register_Model();
        $user = $modUser->where('cell', $data->cell)->first();
        validate($user, '*Esse usuário já está cadastrado!', 'null');

        //CHECA SE EXISTE LINK AGUARDANDO
        $modInvite = new Invite_link_Model();
        $invite = $modInvite->where('cell', $data->cell)->first();
        //
        if ($invite) { //SE EXISTIR USA O MESMO LINK
            $link = $invite->link;
        } else { //SE NÃO EXISTIR GERA UM NOVO LINK
            //GERA LINK
            $invite = $modInvite->orderBy('id', 'DESC')->first();
            if ($invite) {
                $link = password_encode($invite->id + 1);
            } else {
                $link = password_encode(1);
            }
            ;
            $link = $data->table . '@' . $link;

            //SALVA
            $modInvite->protect(false)
                ->save([
                    'id_inviting' => session()->log_userId,
                    'id_invit_table' => $data->table,
                    'id_clinic' => $data->id_clinic,
                    'link' => $link,
                    'name' => $data->name,
                    'cell' => $data->cell,
                ]);
        }
        ;

        //ENVIA CONVITE POR ZAP
        $cel = '55' . $data->cell;
        $url = "https://arcapp.com.br/inv/?k={$link}";
        $message = "Clique no link para confirmar seu cadastro no Instituto Arc: {$url}";
        $linkDescription = 'Link de confirmação de cadastro';
        //
        $resp = $zap->sendLink([
            'instance' => $zapInstance,
            'phone' => $cel,
            'message' => $message,
            'linkDescription' => $linkDescription,
        ]);

        return $this->json(200);
    }
}
