<?php

namespace App\Models\Bank\Config;

use App\Models\Bank\Bank_Model;
use App\Models\Bank\Bank_name_Model;
use App\Models\Bank\Bank_link_Model;
use App\Models\Bank\Bank_balance_Model;
use App\Models\User\User_register_Model;
use App\Models\Tables\Tables_Model;

class Balance_Model
{
    private $modBank;
    private $modBankName;
    private $modBankLink;
    private $modBankBalance;
    private $modUserName;
    private $modTable;

    public function __construct()
    {
        $this->modBank = new Bank_Model();
        $this->modBankName = new Bank_name_Model();
        $this->modBankLink = new Bank_link_Model();
        $this->modBankBalance = new Bank_balance_Model();
        $this->modUserName = new User_register_Model();
        $this->modTable = new Tables_Model();
    }

    //+Busca lista de saldos
    public function getList($tableList)
    {
        $list = [];

        //:EXECUTA POR TABELAS
        foreach ($tableList as $tableId) {
            switch ($tableId) {
                case '10':
                    $tableList = $this->modBankName->findAll();
                    break;

                case '11':
                    $tableList = $this->modUserName->findAll();
                    break;

                default:
                    dieJson('erro');
                    break;
            }

            //:BUSCA NOME DA TABELA
            $tableName = $this->modTable->find($tableId)->name;

            foreach ($tableList as $resp) {
                $respBalance = $this->getBalance($resp->id, $tableId);
                $respbankLink = $this->getBalanceByBankLink($resp->id, $tableId);

                $list[] = [
                    'id' => $respBalance ? $respBalance->id : '0',
                    'sourceId' => $resp->id,
                    'tableId' => $tableId . ' - ' . $tableName,
                    'sourceNm' => $resp->name_short,
                    'count' => $respBalance ? $respBalance->count : '0',
                    'value' => $respBalance ? $respBalance->value : '0',
                    'blCount' => $respbankLink ? $respbankLink['count'] : '0',
                    'blValue' => $respbankLink ? $respbankLink['value'] : '0',
                ];
            }
        }

        return $list;
    }

    //+Busca saldo em "bank_balance"
    public function getBalance($source, $table)
    {
        return $this->modBankBalance
            ->select('
                id,
                id_source,
                id_table,
                count,
                value
            ')
            ->where('id_source', $source)
            ->where('id_table', $table)
            ->first();
    }

    //+Busca saldo em "bank_link"
    public function getBalanceByBankLink($sourceId, $tableId)
    {
        //VALOR POSITIVO
        $dataP = $this->modBankLink
            ->select('COUNT(bank.id) as countP, SUM(bank.value) as sumP')
            ->where('bank_link.id_destination', $sourceId)
            ->where('bank_link.id_destination_table', $tableId)
            ->where('bank_link.positive', 1)
            ->join('bank', 'bank.id = bank_link.id_bank')
            ->findAll()[0];

        //VALOR NEGATIVO
        $dataN = $this->modBankLink
            ->select('COUNT(bank.id) as countN, SUM(bank.value) as sumN')
            ->where('bank_link.id_destination', $sourceId)
            ->where('bank_link.id_destination_table', $tableId)
            ->where('bank_link.positive', 2)
            ->join('bank', 'bank.id = bank_link.id_bank')
            ->findAll()[0];

        $count = $dataP['countP'] + $dataN['countN'];
        $count = $count ?? '0';
        $value = round($dataP['sumP'] - $dataN['sumN'], 2);
        $value = $value ?? '0';

        //RETORNA SOMA
        return ['count' => $count, 'value' => $value];
    }

    //+Atualiza dados
    public function refresh($data)
    {
        $this->modBankBalance->protect(false)->save([
            'id' => $data->balanceId,
            'id_source' => $data->sourceId,
            'id_table' => $data->tableId,
            'count' => $data->refreshCount,
            'value' => $data->refreshValue,
        ]);
    }
}
