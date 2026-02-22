<?php

namespace App\Models;

use CodeIgniter\Model;

class Config_Model extends Model
{
    protected $table = 'config';
    protected $primaryKey = 'name';
    protected $returnType = 'array';
}
