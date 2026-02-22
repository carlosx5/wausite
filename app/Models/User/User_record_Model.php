<?php

namespace App\Models\User;

use App\Libraries\Models\WauModel;

class User_record_Model extends WauModel
{
    protected $table = 'user__record';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
