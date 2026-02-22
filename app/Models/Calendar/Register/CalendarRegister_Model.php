<?php

namespace App\Models\Calendar\Register;

use App\Libraries\Models\WauModel;

class CalendarRegister_Model extends WauModel
{
    protected $table = 'calendar';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
