<?php

namespace App\Models\Bank;

use CodeIgniter\Model;

class Bank_expense_Model extends Model
{
    protected $table = 'bank_expense';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
