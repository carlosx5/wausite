<?php

namespace App\Models\Stock\Register;

use App\Libraries\Models\WauModel;

class StockRegister_Model extends WauModel
{
    protected $table = 'stock';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
