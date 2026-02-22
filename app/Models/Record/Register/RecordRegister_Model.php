<?php

namespace App\Models\Record\Register;

use App\Libraries\Models\WauModel;

class RecordRegister_Model extends WauModel
{
    protected $table = 'record';
    protected $primaryKey = 'id';
    protected $returnType = 'object';

    protected $useTimestamps = true;
}
