<?php

namespace App\Controllers\Bank\Register;

use App\Controllers\FetchController;
use App\Models\Bank\Register\BankRegister_Model;

class BankRegister extends FetchController
{
    private $modBank;

    public function __construct()
    {
        $this->modBank = new BankRegister_Model();
    }

    //:RETORNA DADOS P/ TELA DE BANCO
    public function getData($bankId = null)
    {
        parent::initFetch('58P', false);

        $bankId ??= $this->request->getVar("bankId");
        $returnData = [];

        //:Busca "banco"
        $bankData = $this->getBank($bankId);

        //:Retorna "banco"
        $returnData['bank'] = $bankData;

        //:Retorna "lista de banco"
        $returnData['bankList'] = $this->getBankList();

        dieJson(200, $returnData);
    }

    //:RETORNA CADASTRO DO BANCO
    private function getBank($bankId)
    {
        if (empty($bankId))
            return null;

        $resp = $this->modBank
            ->select('
                bank.id,
                bank.id_clinic,
                bank.name,
                cl.name_social      as clinicName,
            ')
            ->join('clinic cl', 'cl.id = bank.id_clinic', 'left')
            ->where('bank.id', $bankId)
            ->first();

        return $resp;
    }

    //:RETORNA LISTA DE BANCOS
    private function getBankList()
    {
        $clinicId = session('clinic')['id'];

        $resp = $this->modBank
            ->select('
                id,
                name,
            ')
            ->where('id_clinic', $clinicId)
            ->findAll();

        return $resp;
    }

    //:SALVA DADOS DO BANCO
    public function setBank()
    {
        parent::initFetch('68P', false);

        $dbInput = $this->request->getVar('data')->bank;
        $bankId = $dbInput->id;

        if ((int) $bankId > 0) { //.Update
            //:Busca "banco"
            $bankData = $this->getBank($bankId);

            //:Valida clínica do banco
            if ($bankData->id_clinic !== session('clinic')['id'])
                dieJson(453, 'WAU-0176');

            //:Remove campos não editáveis
            unset($bankData->id_clinic);

            $resp = $this->modBank->protect(false)->update($bankId, $dbInput);
        } else { //.Insert
            $dbInput->id_clinic = session('clinic')['id'];
            $resp = $this->modBank->protect(false)->insert($dbInput);
            $bankId = $resp;
        }

        $this->getData($bankId);
    }
}
