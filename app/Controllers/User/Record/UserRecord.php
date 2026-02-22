<?php

namespace App\Controllers\User\Record;

use App\Controllers\FetchController;
use App\Controllers\User\Libraries\UserValidade;
use App\Models\User\Register\UserRegister_Model;
use App\Models\User\User_record_Model;

class UserRecord extends FetchController
{
    private $libValidate;
    private $modUser;
    private $modUserRecord;

    public function __construct()
    {
        $this->libValidate = new UserValidade();
        $this->modUser = new UserRegister_Model();
        $this->modUserRecord = new User_record_Model();
    }

    //:RETORNA REQUEST COM TODOS OS DADOS DA CONFIGURAÇÃO DE PRONTUÁRIO
    public function getData($userId = null)
    {
        parent::initFetch('143P', false);

        $userId ??= $this->request->getVar("userId");
        $returnData = [];

        //:Busca "usuário"
        $userData = $this->getUser($userId);

        //:Se não encontrar usuário, busca dados do usuário logado
        if (empty($userData)) {
            $userData = $this->getUser(session()->log_userId);
            $userId = $userData->id;
        }

        // $modelsModule = ';1;4'; //:Módulos modelo p/ todos os usuários
        // $modulesOrder = $userData->modulesOrder . $modelsModule; //:Junta módulos do usuário com os módulos modelo
        // $modulesOrder = strArray($modulesOrder, '', 'spliter=;,returnAs=2'); //:Organiza em formato stringarray
        // $userData->modulesOrder = $modulesOrder;

        //:Valida acesso ao usuário
        $validate = $this->libValidate->check($userData->id);
        if (!$validate)
            dieJson(458, 'WAU-0016');

        //:Retorna "usuário"
        $returnData['user'] = $userData;
        //:Retorna "register"
        // $returnData['register'] = $this->modRegister->select("id, modulesOrder")->find($sessionValues->userId);

        //:Retorna "modules"
        $returnData['modules'] = $this->getModules($userId);

        dieJson(200, $returnData);
    }

    //:RETORNA DADOS DO USUÁRIO
    private function getUser($userId)
    {
        return $this->modUser
            ->select("
                user.id,
                user.id_clinicMain,
                user.modulesOrder,
                user.name,
                user.updated_at         as optLock,
            ")
            ->where('user.id', $userId)
            ->first();
    }

    //:RETORNA LISTA DE MODULOS DP USUÁRIO + MÓDULOS MODELO
    public function getModules($userId)
    {
        return $this->modUserRecord
            ->where('id_user', $userId)
            ->orWhere('untrash', 1)
            ->findAll();
    }

    //:SALVA TODOS OS DADOS
    public function saveData()
    {
        $optLock = parent::initFetch('999P', true);

        $userId = $this->request->getVar('userId');
        $dbInput = $this->request->getVar('data');

        //:Busca "usuário"
        $userData = $this->getUser($userId);

        //:Valida Optimistic Lock
        if ($userData->optLock !== $optLock)
            dieJson(453);

        //:Valida acesso ao usuário
        $validate = $this->libValidate->check($userData->id);
        if (!$validate)
            dieJson(458, 'WAU-0037');

        //:Altera usuario
        if (isset($dbInput->user)) {
            //:Altera
            $this->setUser($userId, $dbInput->user);
        }

        //:Módulo
        if (isset($dbInput->module)) {
            foreach ($dbInput->module as $moduleItem) {
                //:Deletar
                if (!empty($moduleItem->delete)) {
                    $this->deleteModule($moduleItem);
                } else {
                    //:Criar ou Editar
                    $this->setModule($userId, $moduleItem);
                }
            }
        }

        $this->getData($userId);
    }

    //:ALTERA CADASTRO DE USUÁRIO
    private function setUser($userId, $dbInput)
    {
        if ((int) $dbInput->id !== (int) $userId)
            dieJson(455);

        unset($dbInput->id);

        $this->modUser->protect(false)->update($userId, $dbInput);
    }

    //:SALVA OU ALTERA MÓDULO
    private function setModule($userId, $dbInput)
    {
        if ($dbInput->id === 'new') {
            unset($dbInput->id);
            unset($dbInput->index);

            $dbInput->id_user = $userId;
        }

        $this->modUserRecord->protect(false)->save($dbInput);
        $newId = $this->modUserRecord->getInsertID();

        //:Novo módulo
        if ($newId) {
            $user = $this->modUser->select("id, modulesOrder")->find($userId);

            $modulesOrder = strArray($user->modulesOrder, $newId, 'spliter=;,returnAs=2');
            $row = ['modulesOrder' => $modulesOrder];
            $this->modUser->protect(false)->update($userId, $row);
        }
    }

    //:DELETA MODULO
    private function deleteModule($dbInput)
    {
        $moduleId = $dbInput->id;

        $this->modUserRecord->protect(false)->delete($moduleId);
    }
}
