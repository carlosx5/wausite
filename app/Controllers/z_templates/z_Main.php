<?php

namespace App\Controllers\z_templates;

use App\Controllers\FetchController;
use App\Libraries\Validations\SessionValidate;
use App\Models\Service\Register\ServiceRegister_Model;

class Z_Main extends FetchController
{
    public $libSessionValidate;
    public $modRegister;
    private $table = 'service';

    public function __construct()
    {
        $this->libSessionValidate = new SessionValidate();
        $this->modRegister = new ServiceRegister_Model();
    }

    //:INICIA VALIDAÇÃO DE PACIENTE
    public function serviceMain($access, $revalidate = false)
    {
        //:Checagem invalida -> retorna 468 (sem permissão)
        if (!parent::initFetch($access))
            dieJson(468);

        $serviceId = $this->request->getVar("serviceId");
        ///
        if (strtolower($serviceId) === 'novo') //:Novo serviço -> Retorna id 0 para novo serviço
            return (object)['id' => 0];
        ///
        if (intval($serviceId) <= 0) //:Id inválido -> retorna 455 (id inválido)
            dieJson(455);

        //:Id da fetch é o mesmo da session -> retorna dados da session atualizada e validada
        $checkIsOk = $this->libSessionValidate->check($this->table, $serviceId);
        if ($checkIsOk)
            return $this->libSessionValidate->get();

        //:Não pode revalidar -> retorna 456 (registro não encontrado)
        if (!$revalidate)
            dieJson(456);

        //:Validação do novo Id foi ok -> retorna dados da session atualizada e validada
        $resp = $this->getServiceDataForCheck($serviceId);
        $respValidate = parent::validateForNewSession($resp, 58, $this->table);
        if ($respValidate === true) {
            //:Atualiza session
            $this->setSession($resp);

            //:Retorna session atualizada e validada
            return $this->libSessionValidate->get();
        }

        //:Retorna fetch com erro de validação
        dieJson(458);
    }

    //:ATUALIZA SESSION
    private function setSession($data)
    {
        $this->libSessionValidate->set([
            'table'     => $this->table,
            'serviceId' => $data->serviceId,
        ]);
    }

    //:RETORNA NOVOS DADOS DO BD PARA CHECAGEM
    private function getServiceDataForCheck($serviceId)
    {
        return $this->modRegister
            ->select('
                service.id as serviceId,
                clinic.id as clinicId,
                clinic.id_clinicMain as clinicMainId,
            ')
            ->join('clinic', 'clinic.id = service.id_clinic', 'left')
            ->where('service.id', $serviceId)
            ->first();
    }
}
