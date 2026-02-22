<?php

namespace App\Controllers\Statement;

use App\Controllers\BaseController;
use App\Models\Bank\Statement\Statement_Model;
use App\Models\Bank\Bank_locked_day_Model;

class Statement extends BaseController
{
    private $modStatement;
    private $modBankLockedDay;

    public function __construct()
    {
        $this->modStatement = new Statement_Model();
        $this->modBankLockedDay = new Bank_locked_day_Model();
    }

    /** //+BUSCA LISTA */
    public function getList()
    {
        $this->permission_check([112, 113, 115, 116, 117, 118]);

        $params = $this->request->getVar('data');

        $method = "get_{$params->table}_name";
        $id = $params->id;
        $dateIn = $params->dateIn;
        $dateOut = $params->dateOut;
        $unidentified = $params->unidentified;
        $month = $params->month;
        $valueFilter = $params->valueFilter;
        $user = $params->user;
        $data = [];

        //:BUSCA MENU TOP
        $data['menuTop']['data'] = $this->$method($id);

        //:BUSCA EXTRATO
        $idDestinationTable = [
            'bank' => '10',
            'clinic' => '1',
            'provider' => '7',
            // 'user' => '3,5,6,8,11',  //!UPDATE `bank_link` SET `id_destination_table`='11' WHERE `id_destination_table`='5'
            'user' => '11',
        ];
        //
        $resp = $this->modStatement->get_statement([
            'idDestination' => $id,
            'idDestinationTable' => $idDestinationTable[$params->table],
            'dateIn' => $dateIn,
            'dateOut' => $dateOut,
            'unidentified' => $unidentified ?? 0,
            'month' => $month,
            'posNeg' => $valueFilter,
            'user' => $user ?? 0,
            'table' => $table ?? 15,
        ]);

        //:VERIFICA SE A DATA ESTÁ BLOQUEADA (APENAS EM BANCO)
        $lockedDay = false;
        if ($idDestinationTable[$params->table] == 10 && $dateIn == $dateOut) {
            $lockedDay = $this->modBankLockedDay->checkLockedDay($dateIn, $id);
        }

        //:DATA
        $data['menuTop']['lockedDay'] = $lockedDay;
        $data['list'] = $resp['list'];
        $data['sidebar'] = $resp['balance'];

        return $this->json(200, $data);
    }

    /** //-BUSCA NOME DO BANCO
     * @param int|string $id
     * @return string
     */
    public function get_bank_name($id)
    {
        $name = db_connect()
            ->table('bank_name')
            ->select('id, name_short')
            ->where('id', $id)
            ->get()
            ->getRow();

        return $name;
    }

    /** //-BUSCA NOME DA CLINICA
     * @param int|string $id
     * @return string
     */
    public function get_clinic_name($id)
    {
        $name = db_connect()
            ->table('clinics')
            ->select('id, name_short')
            ->where('id', $id)
            ->get()
            ->getRow();

        return $name;
    }

    /** //-BUSCA NOME DO FORNECEDOR
     * @param int|string $id
     * @return string
     */
    public function get_provider_name($id)
    {
        $name = db_connect()
            ->table('providers')
            ->select('id, name_short')
            ->where('id', $id)
            ->get()
            ->getRow();

        return $name;
    }

    /** //-BUSCA NOME DO USUÁRIO
     * @param int|string $id
     * @return string
     */
    public function get_user_name($id)
    {
        $name = db_connect()
            ->table('user')
            ->select('id, name')
            ->where('id', $id)
            ->get()
            ->getRow();
        if (!$name) {
            return '';
        }

        return $name;
    }

    /** //!BUSCA ID DO USUÁRIO */
    public function get_user_id()
    {
        $bankId = $this->initFetch(112, 'bankId');

        // $data = $this->modStatement
        //     ->select('id_destination as userId')
        //     ->where('id_bank', $bankId)
        //     ->where('id_destination_table', 11)
        //     ->first();

        $data = 'erro!';

        return $this->json(200, $data);
    }

    /** //+ATIVA/DESATIVA ICONE DE CHECAGEM DE LINHA */
    public function set_check()
    {
        $this->permission_check(152);

        $bank = $this->request->getVar('bank');
        $table = $this->request->getVar('table');
        $user = $this->request->getVar('user');
        $active = db_connect()
            ->table('bank_check')
            ->where('id_bank', $bank)
            ->where('id_table', $table)
            ->where('id_user', $user)
            ->get()
            ->getRow();

        $update = ["id_bank" => $bank, "id_table" => $table, "id_user" => $user];

        $q = db_connect()->table('bank_check');
        if ($active) {
            $q->delete($update);
        } else {
            $q->insert($update);
        };

        return $this->json(200);
    }

    /** //+RESSETA ICONE DE CHECAGEM DE LINHA */
    public function resset_check()
    {
        $this->permission_check(9);

        $id = $this->request->getVar('id');

        $q = db_connect()->table('bank_check');
        $q->delete(['link >' => 0]);

        return $this->json(200);
    }
}
