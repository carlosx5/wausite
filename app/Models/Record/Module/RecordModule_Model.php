<?php

namespace App\Models\Record\Module;

use App\Libraries\Models\WauModel;

class RecordModule_Model extends WauModel
{
    protected $table = 'record__module';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
