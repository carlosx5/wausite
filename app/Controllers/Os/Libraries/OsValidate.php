<?php

namespace App\Controllers\Os\Libraries;

class OsValidate
{
    /** //:VERIFICA PERMISSÃO DE ACESSO A OS
     * @param int|string $profId - ID do profissional da OS
     * @param int|string $clinicId - ID da clínica da OS
     * @param int|string $clinicMainId - ID da clínica matriz da OS
     * @param int|string $permThisClinic - Permissão para acessar OS desta clínica
     * @param int|string $permAllClinics - Permissão para acessar OS de todas as clínicas
     */
    public function check($profId = null, $clinicId = null, $clinicMainId = null, $permThisClinic = null, $permAllClinics = null)
    {
        $clinicId = (int) $clinicId;
        $clinicMainId = (int) $clinicMainId;
        $sessLoginId = (int) session()->log_userId;
        $sessClinicId = (int) session("clinic")['id'];
        $sessClinicMainId = (int) session("clinic")['idMain'];

        //:Se profissional da OS for o mesmo do id logado -> retorna true
        if ($profId === $sessLoginId)
            return true;

        //:Checa se tem permissão p/ acessar OS desta clínica
        if (!hasPermission($permThisClinic))
            dieJson(458, 'WAU-0077');
        if ($clinicId === $sessClinicId)
            return true;

        //:Checa se tem permissão p/ acessar OS de todas as filiais
        if (!hasPermission($permAllClinics))
            dieJson(458, 'WAU-0078');
        if ($clinicMainId === $sessClinicMainId)
            return true;

        //:Se não tem nenhuma das permissões
        dieJson(458, 'WAU-0079');
    }
}
