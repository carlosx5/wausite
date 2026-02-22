<?php

namespace App\Models\Marketing\Ads;

use App\Libraries\Models\WauModel;

class AdsTrigger_Model extends WauModel
{
    protected $table = 'ads_trigger';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
