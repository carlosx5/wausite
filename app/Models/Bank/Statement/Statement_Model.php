<?php

namespace App\Models\Bank\Statement;

use App\Models\Bank\Bank_Model;
use App\Models\Bank\Bank_link_Model;
use App\Models\Bank\Bank_balance_Model;

class Statement_Model
{
    private $modBank;
    private $modBankLink;
    private $modBankBalance;

    public function __construct()
    {
        $this->modBank = new Bank_Model();
        $this->modBankLink = new Bank_link_Model();
        $this->modBankBalance = new Bank_balance_Model();
    }

    //.Método para buscar lista
    public function get_statement($data)
    {
        extract($data);

        //*WHERE INICIO
        $wre = "bank_link.id_destination = {$idDestination}";
        if (strpos($idDestinationTable, ',') == false) { //*SE FOR UM UNICO ID (BUSCA MAIS RAPIDO)
            $wre .= " AND bank_link.id_destination_table = {$idDestinationTable}";
        } else { //*SE FOR VARIOS ID (BUSCA MAIS DE VAGAR)
            $wre .= " AND FIND_IN_SET(bank_link.id_destination_table, \"{$idDestinationTable}\")";
        }
        $wre .= " AND bank.deleted_at IS NULL";

        //*WHERE MÊS E ORDEM
        $orderBy = 'id DESC';
        if (strtoupper($month) == 'TODOS') {
            $orderBy = "date_original DESC, {$orderBy}";
        } elseif (strtoupper($month) == 'PASSADO') {
            $wre .= " AND bank.month <= \"2022-04\"";
            $orderBy = "month DESC, {$orderBy}";
        } elseif ($month) {
            $wre .= " AND bank.month = \"{$month}\"";
            $orderBy = "date_original DESC, {$orderBy}";
        }

        //*WHERE DATA
        if ($dateIn) {
            $wre .= " AND bank.date >= \"{$dateIn}\" AND bank.date <= \"{$dateOut}\"";
            $orderBy = 'date_original DESC, id DESC';
        }

        //*WHERE POSITIVO/NEGATIVO
        if ($posNeg) {
            $wre .= " AND bank_link.positive = \"{$posNeg}\"";
        }

        //*WHERE NÃO IDENTIFICADO
        if ($unidentified) {
            $wre .= " AND bank.id_source = 14";
        }

        $select = '
            bank.id as id,
            bank_link.id as id_bl,
            bank_link.positive,
            FORMAT(bank.value, 2, "de_DE") as value,
            DATE_FORMAT(bank.date, "%d/%m/%y") as date,
            bank.date as date_original,
            bank.month,
            bank.description as description,
            bank.id_source,
            bs.name as nm_source,
            cl.name_short as nm_clinic,
        ';
        //
        //*SE FOR BUSCAR CHECK
        if ($table) {
            $select .= 'bc.id_bank as check,';
        }
        //
        //*INICIA BUSCA
        // $regInit = ($pagLimit * $pagInit) - $pagLimit;
        //
        $q = $this->modBankLink;
        $q->select($select);
        $q->where($wre);
        $q->join('bank', 'bank.id = bank_link.id_bank', 'LEFT');
        $q->join('bank_source bs', 'bs.id = bank.id_source', 'LEFT');
        $q->join('clinics cl', 'cl.id = bank.id_clinic', 'LEFT');
        //
        //*SE FOR BUSCAR CHECK
        if ($table) {
            $sql = "bc.id_bank = bank_link.id AND bc.id_user = {$user} AND bc.id_table = {$table}";
            $q->join('bank_check bc', $sql, 'LEFT');
        }
        //
        $q->orderBy($orderBy);
        // $q->limit($pagLimit, $regInit);
        $list = $q->get()->getResultArray();

        //*BUSCA SALDO TOTAL E REGISTROS TOTAL
        $balance = $this->getBalance($idDestination, $idDestinationTable);
        if ($balance->count == 0) {
            $balance = $this->getBalanceByBankLink($idDestination, $idDestinationTable);
            $balance->bankLink = true;
        }

        $totalRegisters = 300; //!TOTAL DE REGISTROS NA TABELA (ESTÁ PROVISÓRIO P/ FUNCIONAR)
        // $totalPage = intval($totalRegisters / $pagLimit); //*TOTAL DE PAGINAS
        // if (($totalPage * $pagLimit) < $totalRegisters) { //*SE DER NUMERO QUEBRADO ADICIONA UMA PÁGINA
        //     $totalPage++;
        // }

        // return ['balance' => $balance, 'list' => $list, 'totalPage' => $totalPage, 'totalRegisters' => $totalRegisters];
        return ['balance' => $balance, 'list' => $list, 'totalRegisters' => $totalRegisters];
    }

    //:Método para buscar saldo via "bank_link"
    public function getBalanceByBankLink($sourceId, $tableId)
    {
        //*VALOR POSITIVO
        $dataP = $this->modBankLink
            ->select('COUNT(bank.id) as countP, SUM(bank.value) as sumP')
            ->where('bank_link.id_destination', $sourceId)
            ->where('bank_link.id_destination_table', $tableId)
            ->where('bank_link.positive', 1)
            ->join('bank', 'bank.id = bank_link.id_bank')
            ->findAll()[0];

        //*VALOR NEGATIVO
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

        //*RETORNA SOMA
        return (object) ['count' => $count, 'value' => $value];
    }

    //:Método para buscar saldo e numero de registros
    public function getBalance($source, $table)
    {
        $response = (object) $this->modBankBalance
            ->select('count, value')
            ->where('id_source', $source)
            ->where('id_table', $table)
            ->first();

        if (!isset($response->count)) {
            $response->count = 0;
            $response->value = 0;
        }
        ;

        return $response;
    }
}
