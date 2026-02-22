<?php

namespace App\Controllers\Tools\ViewMessage;

use App\Controllers\BaseController;

class Message extends BaseController
{
    public function index($errorMode)
    {
        $data['title'] = $this->title($errorMode);
        $data['msg1'] = $this->msg1($errorMode);
        $data['msg2'] = $this->msg2($errorMode);
        $data['logo'] = base_Url('dataSistem/images/logos/wau/logo_home.png');
        $data['theme'] = '';

        echo view('tools/viewMessage/message.html', $data);
    }

    protected function title($errorMode)
    {
        switch ($errorMode) {
            case 'maintenance':
                return 'Manutenção';

            case 'nopermission':
                return 'Permissão';

            case 'apenas-desktop':
                return 'Apenas Desktop';
        }
    }

    protected function msg1($errorMode)
    {
        return match ($errorMode) {
            'em-manutencao'  => 'Sistemas em manutenção!',
            'sem-permissao'  => 'Usuário sem Permissão',
            'apenas-desktop' => 'Esse sistema roda apenas em computadores e notebooks.',
            'login-desktop'  => 'Faça login pelo computador ou notebook!',
            default          => 'Erro desconhecido',
        };
    }

    protected function msg2($errorMode)
    {
        return match ($errorMode) {
            'em-manutencao'  => 'Tente novamente mais tarde.',
            default          => '',
        };
    }
}
