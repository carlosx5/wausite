<?php

namespace App\Libraries\Validations;

use App\Models\Clinic\ClinicRegister_Model;

class ClinicValidate
{
    private $sessId;
    private $sessIdMain;
    private $sessNameSocial;

    public function __construct()
    {
        $this->sessId = (int) session('clinic')['id'];
        $this->sessIdMain = (int) session('clinic')['idMain'];
        $this->sessNameSocial = session('clinic')['nameSocial'];
    }

    /** //:RETORNA DADOS DA CLINICA DA QUAL LOGIN TEM PERMISSÃO
     * 
     * @param mixed $clinicId
     * @param ClinicRegister_Model|null $modClinic
     * @return object Retorna um objeto contendo clinicId, clinicIdMain e clinicNameSocial
     */
    public function check($clinicId, $modClinic = null)
    {
        //:Id da clínica não enviado -> retorna clinica do login
        if (empty($clinicId))
            return $this->returnDefaultClinic();

        //:Converte para numero inteiro
        $clinicId = (int) $clinicId;

        //:Id da clínica é inferior a 1 -> retorna clinica do login
        if ($clinicId < 1)
            return $this->returnDefaultClinic();

        //:Login da clínica não existe "id" -> retorna clinica do login
        if (empty($this->sessId))
            return $this->returnDefaultClinic();

        //:Login da clínica não existir "idMain" -> retorna clinica do login
        if (empty($this->sessIdMain))
            return $this->returnDefaultClinic();

        //:Id da clínica é igual a do login -> retorna clinica do login
        if ($this->sessId === $clinicId) return $this->returnDefaultClinic();

        //:Login não tem permissão para acessar as filiais -> retorna clinica do login
        if (!hasPermission('55P'))
            return $this->returnDefaultClinic();

        //:Checa clínica com a matriz do login
        $modClinic = $modClinic ?: new ClinicRegister_Model();
        $clinicData = $modClinic->select('id, id_clinicMain, name_social')
            ->where('id', $clinicId)
            ->first();
        ///
        if (empty($clinicData)) //:Clínica não foi localizada -> retorna clinica do login
            return $this->returnDefaultClinic();
        ///
        if ((int) $clinicData->id_clinicMain !== $this->sessIdMain) //:Clínica não pertencer a matriz do login -> retorna clinica do login
            return $this->returnDefaultClinic();

        //:Retorna dados da clínica validada
        return (object) [
            'clinicId' => $clinicData->id,
            'clinicIdMain' => $clinicData->id_clinicMain,
            'clinicNameSocial' => $clinicData->name_social
        ];
    }

    //:RETORNA DADOS DA CLINICA DE LOGIN
    public function returnDefaultClinic()
    {
        return (object) [
            'clinicId' => $this->sessId,
            'clinicIdMain' => $this->sessIdMain,
            'clinicNameSocial' => $this->sessNameSocial
        ];
    }
}
