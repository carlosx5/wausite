<?php

namespace App\Models\User;

use CodeIgniter\Model;

class UserActivity_Model extends Model
{
    protected $table = 'user__activity';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
