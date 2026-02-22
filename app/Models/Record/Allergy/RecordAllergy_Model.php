<?php

namespace App\Models\Record\Allergy;

use App\Libraries\Models\WauModel;

class RecordAllergy_Model extends WauModel
{
    protected $table = 'record__allergy';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
