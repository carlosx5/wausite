<?php

namespace App\Controllers\Bank\Entry;

use App\Controllers\BaseController;
use App\Models\Bank\Entry\EntryAdd_Model;
use App\Models\Bank\Bank_expense_Model;

class EntryAdd extends BaseController
{
    private $modEntryAdd;
    private $modExpense;

    public function __construct()
    {
        $this->modEntryAdd = new EntryAdd_Model();
        $this->modExpense = new Bank_expense_Model();
    }

    /**
     * Métoto para enviar o template de lançamentos em banco
     */
    public function bank_entry()
    {
        //BUSCA CLINICAS
        $Clinic_register_Model = new \App\Models\Clinic_register_Model();
        $clinics = $Clinic_register_Model
            ->select('id, name_short')
            ->where('status', 1)
            ->orderBy('id', 'DESC')
            ->findAll();

        //BUSCA TEMPLATE
        $template = view("bank/entry/entryAdd.html");
        echo json_encode(['status' => 200, 'template' => $template, 'clinics' => $clinics]);
        die;
    }

    /** //+FAZ LANÇAMENTO EM "bank" E "bank_link" */
    public function add_entry()
    {
        $this->permission_check(60);

        $data = $this->request->getVar('data');
        $data = json_decode(json_encode($data), true);

        //:SE A SESSÃO EXPIROU
        if (!session()->clinic['id'])
            dieJson(999, 'Sessão expirou!');

        //:FAZ LANÇAMENTOS EM "bank" E "bank_link"
        $this->modEntryAdd->entryAdd($data);

        //:RETURN
        return $this->json(200);
    }

    /**
     * Métoto para dar entrada em paciente + banco
     * @param string $data
     */
    private function patientIn($data)
    {
        //ENTRADA EM "bank"
        db_connect()->table('bank')->insert([
            'description' => $data['description'],
            'date' => $data['date'],
            'value' => $data['value'],
            'available' => $data['available'],
            'enable' => 1,
        ]);
        $newBankId = db_connect()->insertID();

        //ENTRADA PARA PACIENTE EM "bank_link"
        db_connect()->table('bank_link')->insert([
            'id_bank' => $newBankId,
            'id_destination' => $data['patientId'],
            'id_destination_table' => 4,
            'positive' => 1,
        ]);

        //ENTRADA PARA BANCO EM "bank_link"
        db_connect()->table('bank_link')->insert([
            'id_bank' => $newBankId,
            'id_destination' => $data['bankId'],
            'id_destination_table' => 10,
            'positive' => 1,
        ]);

        return $this->json(200, []);
    }

    /**
     * Métoto para gerar lista de usuários em "ajaxSelect.js"
     * @param string $username (POST)
     */
    public function get_user_find()
    {
        $this->permission_check(53);

        $username = $this->request->getVar('find');

        $data['list'] = db_connect()
            ->table('user')
            ->select('id, name')
            ->like('name', $username, 'LEFT')
            ->orderBy('name')
            ->get()
            ->getResultArray();

        return $this->json(200, $data);
    }

    /**
     * Métoto para gerar lista de usuários em "ajaxSelect.js"
     * @param string $find (POST)
     */
    public function find_provider()
    {
        $this->permission_check(9);

        $find = $this->request->getVar('find');

        $data['list'] = db_connect()
            ->table('providers')
            ->select('id, name')
            ->like('name', $find, 'LEFT')
            ->orderBy('name')
            ->get()
            ->getResultArray();

        return $this->json(200, $data);
    }

    /**
     * Métoto para gerar lista dos colaboradores em "ajaxSelect.js"
     * @param string $username (POST)
     */
    public function get_cooperator_find()
    {
        $this->permission_check(68);

        $username = $this->request->getVar('find');

        $data['list'] = db_connect()
            ->table('user')
            ->select('id, name_short')
            ->like('name_short', $username, 'LEFT')
            ->orderBy('name_short')
            ->get()
            ->getResultArray();

        return $this->json(200, $data);
    }

    /**
     * Métoto para gerar lista dos funcionários em "ajaxSelect.js"
     * @param string $find (POST)
     */
    public function get_employee_find()
    {
        $this->permission_check(68);

        $find = $this->request->getVar('find');

        $data['list'] = db_connect()
            ->table('user')
            ->select('id, name')
            ->like('name', $find, 'LEFT')
            ->orderBy('name')
            ->get()
            ->getResultArray();

        return $this->json(200, $data);
    }

    /**
     * Métoto para buscar lista de despesas em "ajaxSelect.js"
     */
    public function find_expense()
    {
        $this->initFetch(68);

        $find = $this->request->getVar('find');

        $data['list'] = $this->modExpense
            ->select('id, name')
            ->like('name', $find, 'LEFT')
            ->orderBy('name')
            ->findAll();

        return $this->json(200, $data);
    }

    /**
     * Métoto para deletar lançamento
     * @param string $bankLinkId (POST)
     */
    public function entryDelete()
    {
        $bankId = $this->initFetch(9, 'bankId');

        //*DELETA
        $this->modEntryAdd->entryDelete($bankId);

        return $this->json(200);
    }
}
