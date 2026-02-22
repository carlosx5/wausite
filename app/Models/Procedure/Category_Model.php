<?php

namespace App\Models\Procedure;

use CodeIgniter\Model;

class Category_Model extends Model
{
    protected $table = 'procedure__category';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
