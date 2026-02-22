<?php

namespace App\Models;

use CodeIgniter\Model;

class Screening_Model extends Model
{
    protected $table = 'screening';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
