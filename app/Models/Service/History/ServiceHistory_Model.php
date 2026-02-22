<?php

namespace App\Models\Service\History;

use App\Controllers\Service\Lib\ServiceModel;

class ServiceHistory_Model extends ServiceModel
{
    protected $table = 'service_history';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
