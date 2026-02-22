<?php

namespace App\Models\Dashboard;

class Dashboard_Model
{
    protected $where = 'id_source = 4';//DESPESA

    public function getExpenseResultSum($userOnly, $user_id, $filterExpenseType)
    {
        $where = $this->where . ' AND month > 2022-05';
        if($filterExpenseType == 'result') {
            $where .= " AND id_source_category != 7 AND id_source_category != 17";
        } elseif($filterExpenseType == 'mobilized') {
            $where .= " AND (id_source_category = 7 OR id_source_category = 17)";
        };

        $q = db_connect()->table('bank');
        $q->select('
            sum(bank.value) as vlExpense,
            bank.month as dt,
        ');
        $q->where($where);
        $q->groupBy('month');
        return $q->get()->getResultArray();
    }

    public function getExpenseResultList($month, $user, $filterExpenseId)
    {
        $and = $this->where ? ' AND ' : '';
        $where = "{$this->where}{$and}month = '{$month}'";
        if($filterExpenseId) {
            $where .= " AND bk.id_source_category = {$filterExpenseId}";
        };

        $q = db_connect()->table('bank bk');
        $q->select('
            bk.id,
            bk.description,
            DATE_FORMAT(bk.date, "%d/%m/%y") as date,
            FORMAT(bk.value, 2, "de_DE") as value,
            bk.month,
            bs.name as nm_source,
            ex.id as id_expense,
            ex.name as nm_expense,
            bc.id_bank as check,
            IF(id_source_category != 7 AND id_source_category != 17, 1, 0) AS mobilized,
        ');
        $q->join('bank_source bs', 'bs.id = bk.id_source', 'LEFT');
        $q->join('expense ex', 'ex.id = bk.id_source_category', 'LEFT');

        $sql = "bc.id_bank = bk.id AND bc.id_user = {$user}";
        $q->join('bank_check bc', $sql, 'LEFT');

        $q->where($where);
        $q->orderBy('id', 'DESC');
        return $q->get()->getResultArray();
    }
}
