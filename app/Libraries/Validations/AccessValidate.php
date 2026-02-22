<?php

namespace App\Libraries\Validations;

class AccessValidate
{
    /** //:CHECA SE LOGIN TEM PERMISSÃO DE ACESSO A ESSE REGISTRO
     * 
     * @param object $data - Objeto com os dados: id_prof, id_clinic, id_clinicMain
     * @param mixed $clinicAccess - Codigo de acesso que autoriza acesso aos registros de toda a clinica
     * @param mixed $branchAccess - Codigo de acesso que autoriza acesso aos registros de todas as filiais
     */
    public  function check($data, $clinicAccess, $branchAccess)
    {
        if (empty($data))
            return null;

        if (!empty($data->id_prof) && session()->log_userId == $data->id_prof)
            return 'true-1';

        if (!empty($data->id_clinic) && hasPermission($clinicAccess) && session('clinic')['id'] == $data->id_clinic)
            return 'true-2';

        if (!empty($data->id_clinicMain) && hasPermission($branchAccess) && session('clinic')['idMain'] == ($data->id_clinicMain))
            return 'true-3';

        return false;
    }
}
