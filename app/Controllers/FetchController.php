<?php

namespace App\Controllers;

class FetchController extends BaseController
{
    public function initFetch($permissions, $optLock = null)
    {
        if (!parent::checkSession())
            dieJson(401, 'WAU-0181');

        //:Verifica se não referenciou "optLock"
        if ($optLock === null)
            dieJson(452, 'WAU-0144');

        //:Verifica acesso
        if (!hasPermission($permissions))
            dieJson(468, 'WAU-0028');

        //:Se usuário não estiver ativo vai p/ tela de login
        if (!parent::checkStatus())
            dieJson(469, 'WAU-0029');

        //:Se referenciou "optLock", retorna valor
        if ($optLock === true) {
            $optLock = $this->request->getVar("optLock");

            if (!$optLock)
                dieJson(452, 'WAU-0145');

            return $optLock;
        }

        return true;
    }

    //:ATUALIZA CAMPO "updated_at"
    public function optLockRefresh($mod, $id)
    {
        $mod->protect(false)->update($id, ['updated_at' => date('Y-m-d H:i:s')]);
    }
}
