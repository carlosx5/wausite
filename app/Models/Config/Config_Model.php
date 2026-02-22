<?php

namespace App\Models\Config;

use CodeIgniter\Model;

class Config_Model extends Model
{
    protected $table = 'config';
    protected $primaryKey = 'name';
    protected $returnType = 'object';
}
