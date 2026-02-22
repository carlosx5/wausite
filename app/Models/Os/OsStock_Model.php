<?php

namespace App\Models\Os;

use CodeIgniter\Model;

class OsStock_Model extends Model
{
    protected $table = 'os__stock';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
