<?php

namespace App\Models\Os;

use App\Libraries\Models\WauModel;

class OsRegister_Model extends WauModel
{
    protected $table = 'os';
    protected $primaryKey = 'id';
    protected $returnType = 'object';

    protected $useTimestamps = true;
}
