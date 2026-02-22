<?php

namespace App\Models\Bank;

use CodeIgniter\Model;

class Bank_locked_day_Model extends Model
{
    protected $table = 'bank_locked_day';
    protected $primaryKey = 'id';
    protected $returnType = 'object';

    /** //-CHECA SE A DATA ESTÁ BLOQUEADA
     * @param string $date
     * @param int|string $idBank
     * @return bool
     */
    public function checkLockedDay($date, $idBank)
    {
        $idBank = ",$idBank,";
        $date = date('Y-m-d', strtotime($date));

        //:LOCALIZA DATA
        $resp1 = $this->where('date', $date)->first();

        //:SE A DATA NÃO EXISTIR, CRIA
        if (!$resp1) {
            $week = dateWeek($date)['int'];
            $this->protect(false)->insert(['date' => $date, 'week' => $week]);
            return false;
        }

        //:VERIFICA SE BANCO EXISTE NA DATA
        $resp2 = exists($resp1->bankList, $idBank);

        return $resp2 ? true : false;
    }
}
