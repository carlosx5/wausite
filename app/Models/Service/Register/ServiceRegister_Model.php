<?php

namespace App\Models\Service\Register;

use App\Libraries\Models\WauModel;

class ServiceRegister_Model extends WauModel
{
    protected $table = 'service';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
