<?php

namespace App\Models\Task;

use CodeIgniter\Model;

class Task_Model extends Model
{
    protected $table = 'tasks';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
