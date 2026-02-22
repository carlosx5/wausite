<?php

namespace App\Models\Bank;

use CodeIgniter\Model;

class Bank_Model extends Model
{
    protected $table = 'bank';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $useSoftDeletes = true;
}
