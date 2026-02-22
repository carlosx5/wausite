<?php

namespace App\Controllers\User\Libraries;

class UserValidade
{
    /** //:VERIFICA PERMISSÃO DE ACESSO AO USUÁRIO
     * @param int|string $userId - ID do usuário a ser verificado
     * @param int|string $clinicId - ID da clínica do usuário
     * @param int|string $clinicMainId - ID da clínica matriz do usuário
     * @param int|string $permThisClinic - Permissão para acessar usuários desta clínica
     * @param int|string $permAllClinics - Permissão para acessar usuários de todas as clínicas
     */
    public function check($userId = null, $clinicId = null, $clinicMainId = null, $permThisClinic = null, $permAllClinics = null)
    {
        $userId = (int) $userId;
        $clinicId = (int) $clinicId;
        $clinicMainId = (int) $clinicMainId;
        $sessLoginId = (int) session()->log_userId;
        $sessClinicId = (int) session("clinic")['id'];
        $sessClinicMainId = (int) session("clinic")['idMain'];

        if ($userId < 1 ||  $sessLoginId < 1)
            dieJson(468, 'WAU-0010');

        //:Se "$userId" for o mesmo do id logado -> retorna true
        if ($userId === $sessLoginId)
            return true;

        //:Checa se tem permissão p/ acessar usuários desta clínica
        if (!hasPermission($permThisClinic))
            dieJson(458, 'WAU-0022');
        if ($clinicId === $sessClinicId)
            return true;

        //:Checa se tem permissão p/ acessar usuários de todas as filiais
        if (!hasPermission($permAllClinics))
            dieJson(458, 'WAU-0021');
        if ($clinicMainId === $sessClinicMainId)
            return true;

        //:Se não tem nenhuma das permissões
        dieJson(458, 'WAU-0023');
    }
}
