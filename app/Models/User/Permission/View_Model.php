<?php

namespace App\Models\User\Permission;

use CodeIgniter\Model;

class View_Model extends Model
{
    protected $table = 'permission_view';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
