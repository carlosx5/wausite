<?php

namespace App\Controllers\Dev;

use App\Controllers\FetchController;
use App\Models\User\Register\UserRegister_Model;
use App\Models\Login\Login_Model;

class DevPermRefresh extends FetchController
{
    private $permis;
    private $modUser;
    private $login;

    public function __construct()
    {
        //:Se for debugger, libera tudo
        $this->permis = session()->debugger == 1 ? '999P' : '9P';

        $this->modUser = new UserRegister_Model();
        $this->login = new Login_Model();
    }

    public function get()
    {
        parent::initFetch($this->permis, false);
        helper(['encode']);

        $userId = session()->log_userId;

        $user = $this->modUser->find($userId);
        $log_email = $user->email;
        $log_password = password_decode($user->password);

        $this->login->doLogin($log_email, $log_password);

        $newPermissions = session()->permissions;

        dieJson(200, ['newPermissions' => $newPermissions]);
    }
}
