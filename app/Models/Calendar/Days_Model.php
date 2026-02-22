<?php

namespace App\Models\Calendar;

use CodeIgniter\Model;

class Days_Model extends Model
{
    protected $table = 'calendar_days';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
