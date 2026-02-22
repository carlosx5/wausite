<?php

namespace App\Models\Country;

use CodeIgniter\Model;

class Country_Model extends Model
{
    protected $table = 'country';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
