<?php

namespace App\Models\Bank;

use CodeIgniter\Model;

class Bank_balance_Model extends Model
{
    protected $table = 'bank_balance';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
