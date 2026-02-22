<?php

namespace App\Models\Provider;

use App\Libraries\Models\WauModel;

class Provider_register_Model extends WauModel
{
    protected $table = 'providers';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
