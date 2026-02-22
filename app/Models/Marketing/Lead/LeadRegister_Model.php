<?php

namespace App\Models\Marketing\Lead;

use CodeIgniter\Model;

class LeadRegister_Model extends Model
{
    protected $table = 'marketing_leads';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
