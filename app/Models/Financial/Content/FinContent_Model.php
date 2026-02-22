<?php

namespace App\Models\Financial\Content;

use CodeIgniter\Model;

class FinContent_Model extends Model
{
    protected $table = 'fin__content';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
