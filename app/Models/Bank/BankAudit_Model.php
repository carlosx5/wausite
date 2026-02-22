<?php

namespace App\Models\Bank;

use CodeIgniter\Model;

class BankAudit_Model extends Model
{
    protected $table = 'bank_audit';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}