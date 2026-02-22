<?php

namespace App\Controllers\User\Permission;

use App\Controllers\FetchController;
use App\Controllers\User\Libraries\UserValidade;
use App\Models\User\Register\UserRegister_Model;
use App\Models\User\Permission\View_Model;
use App\Models\User\Permission\Permission_Model;
use App\Models\User\UserActivity_Model;
use App\Models\User\UserStatus_Model;

class UserPermission extends FetchController
{
    private $libValidate;
    private $modUser;
    private $modView;
    private $modPerm;
    private $modActivity;
    private $table;

    public function __construct()
    {
        $this->libValidate = new UserValidade();
        $this->modUser = new UserRegister_Model();
        $this->modView = new View_Model();
        $this->modPerm = new Permission_Model();
        $this->modActivity = new UserActivity_Model();
        $this->table == 'user';
    }

    //:RETORNA TODOS OS DADOS
    public function getData($userId = null, $newPermValue = null)
    {
        parent::initFetch('51P', false);

        $userId ??= $this->request->getVar("userId");
        $activeView = (int) $this->request->getVar('activeView') ?: 1;
        $returnData = [];

        //:Busca "usuário"
        $userData = $this->getUser($userId);
        unset($userData->email, $userData->password);

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
            dieJson(458, 'WAU-0013');

        //:Retorna "usuário"
        $returnData['user'] = $userData;

        //:Retorna "permissões das atividades"
        $returnData['activityPerm'] = $this->getActivityPerm($userData->activity, $userData->activityPermOn);

        //:Retorna lista de "views"
        $returnData['viewList'] = $this->getViewList();

        //:Retorna lista de "permissões"
        $returnData['permList'] = $this->getpermList($activeView);

        //:Retorna dados do sistema
        $returnData['sistem'] = [
            'activeView' => $activeView,
            'newPermValue' => $newPermValue,
        ];

        dieJson(200, $returnData);
    }

    //:RETORNA DADOS DO USUÁRIO
    private function getUser($userId)
    {
        return $this->modUser
            ->select("
                user.id,
                user.id_clinic,
                user.id_clinicMain,
                user.name,
                user.permissions,
                user.activity,
                user.activityPermOn,
                user.email,
                user.password,
                user.updated_at         as optLock,
                us.status,
            ")
            ->join('user__status us', 'us.id = user.id', 'LEFT')
            ->where('user.id', $userId)
            ->first();
    }

    //:RETORNA LISTA DE VIEWS
    private function getViewList()
    {
        return $this->modView
            ->select('id, name, ord')
            ->orderBy('ord', 'ASC')
            ->findAll();
    }

    //:RETORNA LISTA DE PERMISSÕES
    private function getpermList($viewId)
    {
        $where = ['id_view' => $viewId];

        $isDev = session()->log_dev == 1 ? true : false;
        if (!$isDev)
            $where['dev'] = 0;

        return $this->modPerm
            ->select('id, id_view, name, ord, dev')
            ->where($where)
            ->orderBy('ord', 'ASC')
            ->findAll();
    }

    //:RETORNA PERMISSÕES DAS ATIVIDADES DO QUAL O USUÁRIO PERTENCE
    private function getActivityPerm($activityIds, $activityPermOn)
    {
        //:Se permissão por atividade estiver desativada, retorna vazio
        if ($activityPermOn != 1)
            return '';

        //:Passa p/ array
        $activityIds = strArray($activityIds, '', 'returnAs=1');

        //:Se não tiver atividades, retorna vazio
        if (empty($activityIds))
            return '';

        //:Busca atividades
        $resp = $this->modActivity
            ->select('id, permissions')
            ->whereIn('id', $activityIds)
            ->find();

        //:Junta as permissões de todas as atividades
        $list = '';
        foreach ($resp as $r) {
            $list .= $r->permissions;
        }

        //:Retorna no formato de stringArray
        return strArray($list, '');
    }

    //:SALVA PERMISSÃO DE USUÁRIO
    public function setUserPerm()
    {
        $optLock = parent::initFetch('52P', true);

        $userId = $this->request->getVar("userId");
        $userPerm = $this->request->getVar("userPerm");

        //:Busca "usuário"
        $userData = $this->getUser($userId);

        //:Valida Optimistic Lock
        if ($userData->optLock !== $optLock)
            dieJson(453);

        //:Valida acesso ao usuário
        $validate = $this->libValidate->check(
            $userData->id,
            $userData->id_clinic,
            $userData->id_clinicMain,
            53,
        );
        if (!$validate)
            dieJson(458, 'WAU-0034');

        //:Organiza as permições e adiciona as virgulas antes e depois
        $userPerm = strArray($userPerm, '');

        //:Salva permissões
        $this->modUser
            ->protect(false)
            ->update($userId, ['permissions' => $userPerm]);

        //:Atualiza "refreshLogin" para 1
        $modUserStatus = new UserStatus_Model();
        $modUserStatus->protect(false)->update($userId, ['refreshLogin' => 1]);

        $this->getData($userId);
    }

    //:ATIVA E DESATIVA PERMISSÕES POR ATIVIDADES
    public function setActivityPermOnOff()
    {
        $optLock = parent::initFetch('52P', true);

        $userId = $this->request->getVar("userId");
        $activityPermOn = $this->request->getVar("activityPermOn");

        //:Busca "usuário"
        $userData = $this->getUser($userId);

        //:Valida Optimistic Lock
        if ($userData->optLock !== $optLock)
            dieJson(453);

        //:Se não encontrar usuário -> retorna erro
        if (empty($userData))
            dieJson(456, 'WAU-0048');

        //:Valida acesso ao usuário
        $validate = $this->libValidate->check(
            $userData->id,
            $userData->id_clinic,
            $userData->id_clinicMain,
            53,
        );
        if (!$validate)
            dieJson(458, 'WAU-0049');

        //:Salva permissões
        $this->modUser
            ->protect(false)
            ->update($userId, ['activityPermOn' => $activityPermOn]);

        $this->getData($userId);
    }

    //:SALVA CONFIGURAÇÃO DE VIEWS
    public function setViewConfig()
    {
        parent::initFetch('9P', false);

        $viewList = $this->request->getVar("viewList");

        //:Atualiza matriz de permissões
        foreach ($viewList as $view) {
            $data = [
                'id' => $view->id,
                'name' => $view->name,
                'ord' => $view->ord,
            ];

            if ((int) $data['id'] < 1)
                unset($data['id']);

            $this->modView
                ->protect(false)
                ->save($data);
        }

        $this->getData();
    }

    //:SALVA CONFIGURAÇÃO DE PERMISSÕES
    public function setPermConfig()
    {
        parent::initFetch('9P', false);

        $permList = $this->request->getVar("permList");

        //:Atualiza matriz de permissões
        foreach ($permList as $perm) {
            $data = [
                'id' => $perm->id,
                'id_view' => $perm->id_view,
                'name' => $perm->name,
                'ord' => $perm->ord,
            ];

            if ((int) $data['id'] < 1) { //:Novo
                unset($data['id']);
            } else { //:Edição
                unset($data['id_view']);
            }

            $this->modPerm
                ->protect(false)
                ->save($data);
        }

        $this->getData();
    }

    //:RETORNA DADOS DA ATIVIDADE
    public function getActivity()
    {
        parent::initFetch('9P', false);

        $activityId = $this->request->getVar("activityId");
        $activeView = (int) $this->request->getVar('activeView') ?: 1;

        //:Retorna dados da "atividade"
        $returnData['activity'] = $this->modActivity
            ->where('id', $activityId)
            ->first();

        //:Retorna lista de "views"
        $returnData['viewList'] = $this->getViewList();

        //:Retorna lista de "permissões"
        $returnData['permList'] = $this->getpermList($activeView);

        //:Retorna dados do sistema
        $returnData['sistem'] = [
            'activeView' => $activeView,
            // 'newPermValue' => $newPermValue,
        ];

        dieJson(200, $returnData);
    }

    //:SALVA DADOS DA ATIVIDADE
    public function setActivity()
    {
        parent::initFetch('9P', false);

        $activityId = $this->request->getVar("activityId");
        $activityPerm = $this->request->getVar("activityPerm");

        //:Retorna dados da "atividade"
        $this->modActivity->protect(false)->update($activityId, ['permissions' => $activityPerm]);

        $this->getActivity();
    }
}
