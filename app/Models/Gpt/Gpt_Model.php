<?php

namespace App\Models\Gpt;

use CodeIgniter\Model;

class Gpt_Model extends Model
{
    protected $table = 'gpt';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
