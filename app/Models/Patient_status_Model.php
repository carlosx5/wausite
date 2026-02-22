<?php

namespace App\Models;

use CodeIgniter\Model;

class Patient_status_Model extends Model
{
    protected $table = 'patients_status';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
}
