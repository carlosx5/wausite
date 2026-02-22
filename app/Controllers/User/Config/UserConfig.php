<?php

namespace App\Controllers\User\Config;

use App\Controllers\FetchController;
use App\Controllers\User\Libraries\UserValidade;
use App\Models\User\Register\UserRegister_Model;

class UserConfig extends FetchController
{
    private $libValidate;
    private $modUser;

    public function __construct()
    {
        $this->libValidate = new UserValidade();
        $this->modUser = new UserRegister_Model();
    }

    //:RETORNA REQUEST DE CADASTRO DO USUÁRIO
    public function getData()
    {
        parent::initFetch('999P', false);

        $userId = $this->request->getVar("userId");
        $returnData = [];

        //:Busca "usuário"
        $userData = $this->getUser($userId);

        //:Se não encontrar usuário, busca dados do usuário logado
        if (empty($userData))
            $userData = $this->getUser(session()->log_userId);

        //:Valida acesso ao usuário
        $validate = $this->libValidate->check(
            $userData->id,
            $userData->id_clinic,
            $userData->id_clinicMain,
            53,
        );
        if (!$validate)
            dieJson(458, 'WAU-0042');

        //:Retorna "user"
        $returnData['user'] = $userData;

        dieJson(200, $returnData);
    }

    //:RETORNA CADASTRO DO USUÁRIO
    private function getUser($userId)
    {
        if (empty($userId))
            return null;

        $data = $this->modUser
            ->select("
                id,
                id_clinic,
                id_clinicMain,
                name,
                name_social,
                email,
            ")
            ->where('user.id', $userId)
            ->first();

        unset($data->id_user);
        unset($data->password);
        unset($data->permissions);
        unset($data->token);
        unset($data->token_cel);

        return $data;
    }

    public function colorChange()
    {
        parent::initFetch('999P', false);

        $userId = $this->request->getVar("userId");
        if (empty($userId))
            $userId = session()->log_userId;

        $color = $this->request->getVar("color");
        $returnData = [];

        //:Busca "usuário"
        $userData = $this->getUser($userId);

        //:Se não encontrar usuário -> retorna erro
        if (empty($userData))
            dieJson(456, 'WAU-0040');

        //:Valida acesso ao usuário
        $validate = $this->libValidate->check(
            $userData->id,
            $userData->id_clinic,
            $userData->id_clinicMain,
            53,
        );
        if (!$validate)
            dieJson(458, 'WAU-0041');

        //:Salva nova cor
        $this->modUser
            ->protect(false)
            ->update($userData->id, [
                'theme' => $color
            ]);

        //:Atualiza sessão se for o usuário logado
        if (session()->log_userId == $userData->id)
            session()->set('log_theme', $color);

        //:Retorna para fazer refresh
        dieJson(200);
    }
}
