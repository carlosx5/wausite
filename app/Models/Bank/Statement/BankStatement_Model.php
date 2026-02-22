<?php

namespace App\Models\Bank\Statement;

use CodeIgniter\Model;

class BankStatement_Model extends Model
{
    protected $table = 'bank_statement';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
    protected $useSoftDeletes = true;
}
