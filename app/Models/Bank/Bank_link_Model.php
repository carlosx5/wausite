<?php

namespace App\Models\Bank;

use CodeIgniter\Model;

class Bank_link_Model extends Model
{
    protected $table = 'bank_link';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $useSoftDeletes = true;
}
