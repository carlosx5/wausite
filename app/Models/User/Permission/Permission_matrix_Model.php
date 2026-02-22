<?php

namespace App\Models\Permission;

use App\Libraries\Models\WauModel;

class Permission_matrix_Model extends WauModel
{
    protected $table = 'permissions_matrix';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
