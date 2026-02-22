<?php

namespace App\Models\User\Permission;

use CodeIgniter\Model;

class Permission_Model extends Model
{
    protected $table = 'permission';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
