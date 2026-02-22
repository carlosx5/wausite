<?php

namespace App\Models\Bank;

use CodeIgniter\Model;

class Bank_register_Model extends Model
{
    protected $table = 'bank_link';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $useSoftDeletes = true;

    public function get_registers($id)
    {
        $data['bank'] = $this->get_bank($id);
        $data['bankLink'] = $this->get_bank_link($id);

        if ($data['bank']['id_source'] == 4) {
            $data['expenseList'] = $this->get_expenseList();
        };

        return $data;
    }

    public function get_bank($id)
    {
        $q = db_connect()->table('bank');
        $q->select('
                bank.id as id,
                bank.id_login,
                FORMAT(bank.value, 2, "de_DE") as value,
                DATE_FORMAT(bank.date, "%d/%m/%y") as date,
                bank.date as date_original,
                bank.month,
                bank.description,
                clinics.name_social as clinic_name,
                clinics.id as clinic_id,
                user.name_social as nm_login,
                id_source,
                id_source_category,
            ');
        $q->where('bank.id', $id);
        $q->join('clinics', 'clinics.id = bank.id_clinic');
        $q->join('user', 'user.id = bank.id_login');
        $bank = $q->get()->getResultArray()[0];

        if ($bank['id_source'] == 4) {
            $q = db_connect()->table('bank_expense');
            $q->select('name');
            $q->where('id', $bank['id_source_category']);
            $bank['expense'] = $q->get()->getRow()->name;
        };

        return $bank;
    }

    public function get_bank_link($idBank)
    {
        $q = $this;
        $q->select('
            id,
            id_destination,
            id_destination_table,
            positive,
        ');
        $q->where('id_bank', $idBank);
        $bankLink = $q->findAll();

        foreach ($bankLink as $key => $bl) {
            switch ($bl['id_destination_table']) {
                case '1': //ADICIONA CLÍNICA
                    $q = db_connect()->table('clinics');
                    $q->select('name_social');
                    $q->where('id', $bl['id_destination']);
                    $bankName = $q->get()->getResultArray();

                    $bankLink[$key]["entry"] = 'Clínica';
                    $bankLink[$key]['name'] = $bankName[0]['name_social'];

                    $bankLink[$key]['entryList'] = $this->get_clinicList();
                    break;

                case '7': //ADICIONA FORNECEDOR
                    $q = db_connect()->table('providers');
                    $q->select('name_social');
                    $q->where('id', $bl['id_destination']);
                    $bankName = $q->get()->getResultArray();

                    $bankLink[$key]["entry"] = 'Fornecedor';
                    $bankLink[$key]['name'] = $bankName[0]['name_social'];

                    $bankLink[$key]['entryList'] = $this->get_providerList();
                    break;

                case '9': //ADICIONA OS
                    $bankLink[$key]["entry"] = 'OS';
                    $bankLink[$key]['name'] = 'Ordem de Serviço';
                    break;

                case '10': //ADICIONA NOME DO BANCO
                    $q = db_connect()->table('bank_name');
                    $q->select('name_social');
                    $q->where('id', $bl['id_destination']);
                    $bankName = $q->get()->getResultArray();

                    $bankLink[$key]["entry"] = 'Banco';
                    $bankLink[$key]['name'] = $bankName[0]['name_social'];

                    $bankLink[$key]['entryList'] = $this->get_bankList();
                    break;

                case '11': //ADICIONA USUÁRIO
                    $q = db_connect()->table('user');
                    $q->select('name_social');
                    $q->where('id', $bl['id_destination']);
                    $bankName = $q->get()->getResultArray();

                    $bankLink[$key]["entry"] = 'Usuário';
                    $bankLink[$key]['name'] = $bankName[0]['name_social'];

                    $bankLink[$key]['entryList'] = []; //$this->get_userList();
                    break;

                default:
                    die(json_encode('ERRO!'));
                    break;
            };
        };

        return $bankLink;
    }

    public function get_expenseList()
    {
        $q = db_connect()->table('bank_expense');
        $q->select('id, name');
        $q->orderBy('name');
        return $q->get()->getResultArray();
    }

    public function get_clinicList()
    {
        $q = db_connect()->table('clinics');
        $q->select('id, name_short as name');
        $q->orderBy('name_short');
        return $q->get()->getResultArray();
    }

    public function get_providerList()
    {
        $q = db_connect()->table('providers');
        $q->select('id, name_short as name');
        $q->orderBy('name_short');
        return $q->get()->getResultArray();
    }

    public function get_bankList()
    {
        $q = db_connect()->table('bank_name');
        $q->select('id, name_short as name');
        $q->orderBy('name_short');
        return $q->get()->getResultArray();
    }
}
