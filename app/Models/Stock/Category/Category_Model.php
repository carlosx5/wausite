<?php

namespace App\Models\Stock\Category;

use App\Libraries\Models\WauModel;

class Category_Model extends WauModel
{
    protected $table = 'stock_category';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
