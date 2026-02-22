<?php

namespace App\Controllers\Task\Register;

use App\Controllers\BaseController;
use App\Models\Task\Report\TaskReport_Model;

class TaskRegister extends BaseController
{
    public function __construct()
    {
        $this->modTaskReport = new TaskReport_Model();
    }
}
