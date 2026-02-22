<?php

namespace App\Controllers\Patient\Libraries;

class PatientValidate
{
    /** //:VERIFICA PERMISSÃO DE ACESSO AO PACIENTE
     * @param int|string $patientId - ID do paciente a ser verificado
     * @param int|string $clinicId - ID da clínica do paciente
     * @param int|string $clinicMainId - ID da clínica matriz do paciente
     * @param int|string $permThisClinic - Permissão para acessar pacientes desta clínica
     * @param int|string $permAllClinics - Permissão para acessar pacientes de todas as clínicas
     */
    public function check($patientId = null, $clinicId = null, $clinicMainId = null, $permThisClinic = null, $permAllClinics = null)
    {
        $patientId = (int) $patientId;
        $clinicId = (int) $clinicId;
        $clinicMainId = (int) $clinicMainId;
        $sessClinicId = (int) session("clinic")['id'];
        $sessClinicMainId = (int) session("clinic")['idMain'];

        if ($patientId < 1)
            dieJson(454, 'WAU-0053');

        //:Checa se tem permissão p/ acessar pacientes desta clínica
        if (!hasPermission($permThisClinic))
            dieJson(458, 'WAU-0054');
        if ($clinicId === $sessClinicId)
            return true;

        //:Checa se tem permissão p/ acessar usuários de todas as filiais
        if (!hasPermission($permAllClinics))
            dieJson(458, 'WAU-0055');
        if ($clinicMainId === $sessClinicMainId)
            return true;

        //:Se não tem nenhuma das permissões
        dieJson(458, 'WAU-0056');
    }
}
