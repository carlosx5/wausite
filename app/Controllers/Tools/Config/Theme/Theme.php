<?php

namespace App\Controllers\Tools\Config\Theme;

use App\Controllers\FetchController;
use App\Models\User\Register\UserRegister_Model;

class theme extends FetchController
{

    public $modUser;

    public function __construct()
    {
        $this->modUser = new UserRegister_Model();
    }

    /** //+Troca tema */
    public function toggleTheme($theme = null)
    {
        $this->initFetch('999P');

        //:Busca id do usuario
        $userId = session()->log_userId;

        //:Seta novo tema
        $this->modUser->protect(false)->update($userId, ['theme' => $theme]);
        session()->set('log_theme', $theme);

        dieJson(200, $theme);
    }
}
