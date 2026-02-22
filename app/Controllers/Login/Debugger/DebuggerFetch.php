<?php

namespace App\Controllers\Login\Debugger;

use App\Controllers\FetchController;
use App\Models\User\Register\UserRegister_Model;

class DebuggerFetch extends FetchController
{
    private $login;
    private $modUser;

    public function __construct()
    {
        $this->login = new \App\Models\Login\Login_Model();
        $this->modUser = new UserRegister_Model();
    }

    public function getUserList()
    {
        parent::initFetch('9P', false);

        $find = $this->request->getVar('find');
        $clinicId = $this->request->getVar('clinicId');
        $clinicStatus = $this->request->getVar('clinicStatus');
        $userStatus = $this->request->getVar('userStatus');
        $returnData = [];

        //:WHERE -> inicia $where
        $where = [];
        //:WHERE -> usuário de uma clínica específica
        if ($clinicId) {
            $where['user.id_clinic'] = $clinicId;
        }
        //:WHERE -> usuário inativo/ativo/todos
        if ($userStatus === 0) {
            $where['us.status'] = 0;
        } elseif ($userStatus === 1) {
            $where['us.status'] = 1;
        } elseif ($userStatus === 2) {
            //:Não filtra usuário
        }
        //:WHERE -> clínica inativo/ativo/todos
        if ($clinicStatus === 0) {
            $where['cl.status'] = 0;
        } elseif ($clinicStatus === 1) {
            $where['cl.status'] = 1;
        } elseif ($clinicStatus === 2) {
            //:Não filtra clínica
        }

        //:BUILDER -> inicia query
        $builder = $this->modUser
            ->select("
                user.id as userId,
                user.name as userName,
                us.status as userStatus,
                cl.name_social as clinicName,
                cl.status as clinicStatus,
            ")
            ->join('user__status us', 'user.id = us.id', 'left')
            ->join('clinic cl', 'user.id_clinic = cl.id', 'left')
            ->orderBy('user.name');
        //:BUILDER -> like
        if (!empty($find)) {
            $builder->like('user.name', $find, 'after');
        }
        //:BUILDER -> where
        if (!empty($where)) {
            $builder->where($where);
        }
        //:BUILDER -> Executa a query
        $returnData['userList'] = $builder->findAll(15);

        dieJson(200, $returnData);
    }

    public function startDebugger()
    {
        parent::initFetch('9P', false);
        helper(['encode', 'cookie']);

        $userId = $this->request->getVar('userId');

        $user = $this->modUser->find($userId);
        $log_email = $user->email;
        $log_password = password_decode($user->password);

        $this->login->doLogin($log_email, $log_password);

        session()->set('debugger', 1);
        setCook('debugger', getCook('token'));

        dieJson(200);
    }

    public function stopDebugger()
    {
        parent::initFetch('999P', false);
        helper(['encode', 'cookie']);

        delCook('debugger');
        session()->remove('debugger');

        $userData = $this->modUser->find(1);
        $logEmail = $userData->email;
        $logPassword = password_decode($userData->password);

        $this->login->doLogin($logEmail, $logPassword);

        dieJson(200);
    }
}
