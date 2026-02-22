<?php

namespace App\Models\Procedure;

use App\Libraries\Models\WauModel;

class Procedure_Model extends WauModel
{
    protected $table = 'procedure';
    protected $primaryKey = 'id';
    protected $returnType = 'object';

    protected $useTimestamps = true;
}
