<?php

namespace App\Models\Marketing\Lead;

use App\Libraries\Models\WauModel;

class Marketing_lead_Model extends WauModel
{
    protected $table = 'old_marketing_leads';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
    protected $useTimestamps = true;
}
