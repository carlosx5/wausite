<?php

namespace App\Controllers\User\Invite;

use App\Controllers\UnloggedController;
use App\Models\User\User_register_Model;
use App\Models\User\Invite\Invite_link_Model;
use App\Libraries\Whatsapp\Whatsapp;

class user_invite_register extends UnloggedController
{
    public function index()
    {
        $key = $this->request->getGet('k');

        $modInvite = new Invite_link_Model();
        $invite = $modInvite
            ->select('invites_link.*, clinics.name_short as nm_clinic')
            ->where('link', $key)
            ->join('clinics', 'clinics.id = invites_link.id_clinic', 'LEFT')
            ->first();

        //SE CONVITE NÃO EXISTIR
        if (!$invite) {
            $data = $this->dataCreate('tools/tools/message', '', '');
            $data['logoLab'] = base_Url('/img/logos/arc/arc1_01.webp');

            return (viewShow('errors/html/invite_error', $data, false, false));
        }
        ;

        //BUSCA O AUTOR DO CONVITE
        $modUser = new User_register_Model();
        $invitationIssuerName = $modUser->first($invite->id_inviting)['name_short'];

        //DATA
        $data = $this->dataCreate(
            'user/invite/user_invite_register',
            'user/invite/user_invite_register',
            ''
        );
        $data['logoLab'] = base_Url('/img/logos/arc/arc1_01.webp');
        $data['name1'] = $invite->name;
        $data['name2'] = $invitationIssuerName;
        $data['cell'] = $invite->cell;
        $data['nm_clinic'] = $invite->nm_clinic;
        $data['varJS']['invitingId'] = $invite->id_inviting;
        $data['varJS']['key'] = $key;

        return (viewShow('user/invite/user_invite_register', $data, true, false));
    }

    public function doRegister()
    {
        helper(['validate', 'global', 'defaultPermissions']);

        $modUser = new User_register_Model();
        $modInvite = new Invite_link_Model();
        $zap = new Whatsapp();
        $zapInstance = 'recepcao';
        validate($zap->checkConnected($zapInstance), '*WhatsApp desconectado!');

        $data = $this->request->getVar('data');
        $table = explode('@', $data->key)[0];
        $link = $data->key;

        //VALIDAÇÃO
        validate($data->name, 'nome');
        validate($data->cell, 'celular', 'cel');
        validate($data->email, 'email');
        validate($data->userName, 'usuário');
        validate($data->password, 'senha');

        //CHECA INVITE
        $invite = $modInvite->where('link', $link)->first();
        validate($invite, '*Convite não localizado!');

        //CHECA SE JÁ ESTÁ CADASTRADO
        $user = $modUser->where('cell', $data->cell)->first();
        validate($user, '*Esse usuário já está cadastrado!', 'false');

        //VERIFICA SE EMAIL JÁ EXISTE
        $checkEmailExists = $modUser->where('email', $data->email)->first();
        validate($checkEmailExists, '*Esse email já existe!', 'false');

        //CHECA AUTOR DO CONVITE
        $invitationIssuer = $modUser->get_userStatus($data->invitingId);
        validate($invitationIssuer, '*Autor do convite inativo!', 'true');

        //DATA
        $data->id_clinic = $invite->id_clinic;
        $data->id_clinicLog = $data->id_clinic;
        $data->userName = strtolower($data->userName);
        $data->password = password_encode($data->password);
        //
        if ($table == 6) { //AGENTE
            // $data->permissions = default_permission('agent');
            $data->function = 6;
            $data->activity = ',6,';
        } elseif ($table == 5) { //MEDICO
            // $data->permissions = default_permission('doctor');
            $data->function = 5;
            $data->activity = ',5,6,';
        } elseif ($table == 3) { //COLETADOR
            // $data->permissions = default_permission('collector');
            $data->function = 3;
            $data->activity = ',3,';
        } elseif ($table == 14) { //FUNCIONÁRIO
            // $data->permissions = default_permission('employee');
            $data->function = 14;
            $data->activity = ',14,';
        }
        ;

        unset($data->invitingId);
        unset($data->key);
        unset($data->status);

        //ADD USUÁRIO
        $result = $modUser->set_userAndStatus($data);

        //DELETE INVITE
        $modInvite->where('link', $link)->delete();

        //ENVIA ACESSO POR ZAP
        $cel = '55' . $data->cell;
        $url = "https://arcapp.com.br";
        $message = "Clique no link para acessar o sistema. Acesso apenas pelo computador ou notebook: {$url}";
        $linkDescription = 'Link de acesso ao sistema.';
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
