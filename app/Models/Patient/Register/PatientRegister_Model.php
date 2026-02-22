<?php

namespace App\Models\Patient\Register;

use App\Libraries\Models\WauModel;

class PatientRegister_Model extends WauModel
{
    protected $table = 'patient';
    protected $primaryKey = 'id';
    protected $returnType = 'object';

    protected $useSoftDeletes = true;
    protected $useTimestamps = true;
}
