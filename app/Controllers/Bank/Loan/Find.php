<?php

namespace App\Controllers\Bank\Loan;

use App\Controllers\BaseController;
use App\Models\Bank\Loan\BankLoan_Model;

class Find extends BaseController
{
    public function __construct()
    {
        $this->modLoan = new BankLoan_Model();
    }

    /**
     * Métoto para buscar clínicas
     */
    public function findLoan()
    {
        $find = $this->request->getVar('find');

        $data['list'] = $this->modLoan
            ->select('id, name as col1')
            ->like('name', $find, 'LEFT')
            ->orderBy('name')
            ->limit(20)
            ->findAll();

        return $this->json(200, $data);
    }
}
