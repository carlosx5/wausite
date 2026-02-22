<?php

namespace App\Controllers\Tools\Test;

use App\Controllers\BaseController;

class Test extends BaseController
{
    public function __construct()
    {
    }

    public function index()
    {
        // die('DIE');

        $res = db_connect()->table('bank_link')
            ->select('
                bank.month,
                bank.value,
                bank_link.id,
                bank_link.id_destination,
                bank_link.id_destination_table,
            ')
            ->join('bank', 'bank.id = bank_link.id_bank')
            ->where('bank.month <', '2022-06')
            ->where('bank_link.id_destination_table', 1)
            ->where('bank_link.deleted_at', null)
            ->get()
            ->getResultArray();

        foreach ($res as $r) {
            db_connect()->table('bank_link')
                ->where('id', $r['id'])
                ->update(['id_destination' => 3]);
        }

        echo json_encode($res);
    }

    public function index2()
    {
        die('DIE');

        $result = $this->Os_register_Model
            ->select('id, created_at, month')
            ->orderBy('id')
            ->findAll();

        foreach ($result as $key => $res) {
            $explode = explode('-', $res['created_at']);
            $month = $explode[0] . '-' . $explode[1];

            $data = [
                'month' => $month,
            ];

            db_connect()->table('os')
                ->where('id', $res['id'])
                ->update($data);
        };

        echo json_encode($result);
        die;
    }

    public function index1()
    {
        die;

        $q = db_connect()->table('bank_link');
        $q->select('
                bank_link.id as id,
                bank_link.id_destination_table,
                FORMAT(bank.value, 2, "de_DE") as value,
                DATE_FORMAT(bank.date, "%d/%m/%Y") as date,
                bank.date as date_original,
                bank.month,
                bank.description as description,
            ');
        $q->where('id_destination_table', 8);
        $q->like('description', 'carimbo');
        $q->join('bank', 'bank.id = bank_link.id_bank');
        $q->orderBy('id');
        $result = $q->get()->getResultArray();

        echo json_encode($result);
        die;

        $q = db_connect()->table('bank_link');
        $q->select('bank_link.id');
        $q->where('bank_link.id_destination_table', 5);
        $q->like('bank.description', 'carimbo');
        $q->join('bank', 'bank.id = bank_link.id_bank');
        $result = $q->get()->getResultArray();

        $resultArray = [];
        foreach ($result as $key => $val) {
            $resultArray[] = $val['id'];
        };

        $stringResult = implode(",", $resultArray);

        $q = db_connect()->table('bank_link');
        $q->where("FIND_IN_SET(id, \"{$stringResult}\")");
        $result = $q->update(['id_destination_table' => 8]);
        echo json_encode($result);
        die;
    }
}
