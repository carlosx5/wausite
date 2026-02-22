<?php

namespace App\Models\Bank\Loan;

use App\Libraries\Models\WauModel;

class BankLoan_Model extends WauModel
{
    protected $table = 'bank_loan';
    protected $primaryKey = 'id';
    protected $returnType = 'object';

    public function getList($registerId)
    {
        if (!$registerId)
            return [];

        $where = "
            id_destination = {$registerId}
            AND id_destination_table = 13
            AND bl.deleted_at IS NULL
        ";

        $select = "
            bk.id as id,
            bl.id as id_bl,
            bl.positive,
            FORMAT(bk.value, 2, 'de_DE') as value,
            DATE_FORMAT(bk.date, '%d/%m/%Y') as date,
            bk.date as date_original,
            bk.month,
            bk.description as description,
            bk.id_source,
            bs.name as nm_source,
            cl.name_short as nm_clinic,
        ";

        $q = db_connect()->table('bank_link bl');
        $q->select($select);
        $q->where($where);
        $q->join('bank bk', 'bk.id = bl.id_bank', 'LEFT');
        $q->join('bank_source bs', 'bs.id = bk.id_source', 'LEFT');
        $q->join('clinics cl', 'cl.id = bk.id_clinic', 'LEFT');

        $q->orderBy('id');
        $statement = $q->get()->getResultArray();

        return $statement;
    }
}
