<?php

namespace App\Controllers\User\Register;

use App\Controllers\FetchController;
use App\Controllers\User\Libraries\UserValidade;
use App\Models\User\Register\UserRegister_Model;
use App\Models\User\UserActivity_Model;

class UserRegister extends FetchController
{
    private $libValidate;
    private $modUser;
    private $modUserActivity;

    public function __construct()
    {
        $this->libValidate = new UserValidade();
        $this->modUser = new UserRegister_Model();
        $this->modUserActivity = new UserActivity_Model();
    }

    //:RETORNA REQUEST DE CADASTRO DO USUÁRIO
    public function getData($userId = null)
    {
        parent::initFetch('50P', false);

        $userId ??= $this->request->getVar("userId");
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
            dieJson(458, 'WAU-0012');

        //:Retorna "usuário"
        $returnData['user'] = $userData;

        //:Retorna "lista de atividades"
        $returnData['activityList'] = $this->getActivityList();

        dieJson(200, $returnData);
    }

    //:RETORNA CADASTRO DO USUÁRIO
    private function getUser($userId)
    {
        if (empty($userId))
            return null;

        $data = $this->modUser
            ->select('
                user.*,
                user.updated_at     as optLock,
                us.status,
                ue.*,
                cl.name_social      as nm_clinic,
                cllog.name_social   as nm_clinicLog
            ')
            ->join('user__status us', 'us.id = user.id', 'LEFT')
            ->join('clinic cl', 'cl.id = user.id_clinic', 'LEFT')
            ->join('clinic cllog', 'cllog.id = user.id_clinicLog', 'LEFT')
            ->join('users_employee ue', 'ue.id_user = user.id', 'LEFT')
            ->where('user.id', $userId)
            ->first();

        unset($data->id_user);
        unset($data->password);
        unset($data->permissions);
        unset($data->token);
        unset($data->token_cel);

        return $data;
    }

    //:RETORNA LISTA DE ATIVIDADES DO USUÁRIO
    private function getActivityList()
    {
        return $this->modUserActivity->orderBy('ord', 'ASC')->findAll();
    }

    //:SALVA DADOS DO USUÁRIO
    public function setUser()
    {
        $optLock = parent::initFetch('1P', true);

        $userId = $this->request->getVar('userId');
        $dbInput = $this->request->getVar('data')->user;

        if ((int) $dbInput->id > 0) { //:Se for edição
            //:Busca "usuário"
            $userData = $this->getUser($userId);

            //:Valida Optimistic Lock
            if ($userData->optLock !== $optLock)
                dieJson(453, 'WAU-0169');

            //:Valida acesso ao usuário
            $validate = $this->libValidate->check(
                $userData->id,
                $userData->id_clinic,
                $userData->id_clinicMain,
                53,
            );
            if (!$validate)
                dieJson(458, 'WAU-0012');
        } else { //:Se for novo cadastro
            $dbInput->activityPermOn = 1;

            if ($userId === 'new' && $dbInput->id !== 'new')
                dieJson(400, 'WAU-0025');
        }

        //:Checa se campo de atividade foi alterado
        if (isset($dbInput->activity)) {
            $activityInput = strArray($dbInput->activity); //:Avividades vindas do fetch
            $activityData = strArray($userData->activity); //:Atividades que estão no banco

            if ($activityInput !== $activityData) {
                //:Se os valores forem diferentes -> atualiza banco com os novos valores
                $dbInput->activity = $activityInput;
            } else {
                //:Se os valores forem iguais -> remove campo para não atualizar no banco
                unset($dbInput->activity);
            }
        }

        unset(
            $dbInput->id_clinic,
            $dbInput->nm_clinic,
            $dbInput->nm_clinicLog,
            $dbInput->status,
            $dbInput->passwordfake,
        );

        //:Salvar
        $userId = $this->modUser->saveWau($dbInput);

        //:Se for novo, cria user__status
        if ($this->request->getVar('userId') === 'new') {
            $modStatus = new \App\Models\User\UserStatus_Model();
            $modStatus->protect(false)->insert(['id' => $userId, 'status' => 1]);
        }

        $this->getData($userId);
    }
}
