<?php

namespace App\Controllers\Bank\Statement;

use App\Controllers\Bank\BankMain;
use App\Models\bank\Statement\BankStatement_Model;


class BankStatement extends BankMain
{
    private $modbankStatement;

    public function __construct()
    {
        parent::__construct();
        $this->modbankStatement = new BankStatement_Model();
    }

    //:RETORNA REQUEST DE EXTRATO DE BANCO
    public function getData()
    {
        $sessionValues = $this->bankMain(104, true);
        $returnData = [];

        //:Retorna lista de extrato do paciente
        $returnData['list'] = $this->getList($sessionValues->id);

        //:Retorna localStorage
        $returnData['localStorage'] = [
            'bankId' => $sessionValues->id,
            'bankName' => $sessionValues->bankName,
        ];

        dieJson(200, $returnData);
    }

    //:RETORNA LISTA DE EXTRATO DE BANCO
    private function getList($bankId)
    {
        if (empty($bankId))
            return [];

        $resp = $this->modbankStatement
            ->select("
                bkpa.*,
                FORMAT(bkpa.value, 2, 'de_DE') as value,
                DATE_FORMAT(bank.date, '%d/%m/%Y') as date,
                bank.available,
                bank.description
            ")
            ->join('bank', 'bank.id = bkpa.id_bank', 'left')
            ->where('bkpa.id_patient', $bankId)
            ->findAll();

        return $resp;
    }
}
