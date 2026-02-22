<?php

namespace App\Models\Patient\Statement;

use CodeIgniter\Model;

class PatientStatement_Model extends Model
{
    protected $table = 'bank_patient bkpa'; //*modelTable = 'bkpa'
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
