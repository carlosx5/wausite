<?php

namespace App\Models;

use CodeIgniter\Model;

class Bank_Model extends Model
{
    protected $table = 'bank';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $useSoftDeletes = true;

    /**
     * Método de busca de somatórias totais de despesas
     * @param string $month
     * @return array
     */
    public function get_sum_expense($clinicId, $month)
    {
        $q = $this;
        $q->select('
            COUNT(id) as count,
            SUM(value) as sumValue,
        ');
        $q->where('id_source', 4);
        $q->where('month', $month);
        if ($clinicId != 'all') {
            $q->where('bank.id_clinic', $clinicId);
        }
        $result = $q->findAll();

        return $result;
    }

    /**
     * Método de busca de lista de despesas
     * @param string $month
     * @param string $pagLimit
     * @param string $regInit
     * @return array
     */
    public function get_list_expense($clinicId, $month, $pagLimit, $regInit)
    {
        $q = $this;
        $q->select('
            bank.id,
            month,
            description,
            date as date_us,
            DATE_FORMAT(date, "%d/%m/%Y") as date,
            FORMAT(value, 2, "de_DE") as value,
            expense.name as category,
            user.name_social as user,
        ');
        $q->where('id_source', 4);
        $q->where('month', $month);
        if ($clinicId != 'all') {
            $q->where('bank.id_clinic', $clinicId);
        }
        $q->join('expense', 'expense.id = id_source_category', 'LEFT');
        $q->join('user', 'user.id = id_login', 'LEFT');
        $q->orderBy('date_us DESC, id DESC');
        $q->limit($pagLimit, $regInit);
        $osList = $q->find();

        return $osList;
    }
}
