<?php

namespace App\Libraries;

class WhereMaker
{
    public static function get(): string|array
    {
        //:Verifica se "mainClinicActive" está ativo e se tem permissão
        $mainClinicActive = (+getCook('mainClinicActive') && hasPermission('55P')) ? true : null;

        //:Busca session
        $sess = session()->clinic[$mainClinicActive ? 'idMain' : 'id'];

        //:Cria $where
        $where = $mainClinicActive ?  "id_clinicMain = {$sess}" : "id_clinic = {$sess}";

        return $where;
    }
}
