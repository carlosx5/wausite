<?php

namespace App\Controllers\Tools\Config\Config;

use App\Controllers\ViewController;

class Config extends ViewController
{
    /**
     * Método formação de tela PC
     */
    public function index()
    {
        // $this->initBackend(9, 'SbMenuOn=Configurações');

        $data = $this->dataCreate(
            'tools/config/config/config',
            'tools/config/config/config',
            'config'
        );
        $data['refresh'] = session()->refresh;

        return (viewShow('tools/config/config/config', $data));
    }

    /**
     * Método para forçar login de todos os usuários
     */
    public function login1()
    {
        // $this->permission_check(9);

        $Config_Model = new \App\Models\User\UserStatus_Model();

        $Config_Model->refresh(1);

        db_connect()
            ->table('user')
            ->update(['relog' => 1]);

        echo json_encode(['status' => 200]);
        die;
    }

    /**
     * Método para atualizar acesso de todos os médicos
     */
    public function access2()
    {
        // $this->permission_check(9);
        die;

        db_connect()
            ->table('user')
            ->where()
            ->update(['relog' => 1]);

        echo json_encode(['status' => 200]);
        die;
    }
}
