<?php

namespace App\Models\Voucher;

use CodeIgniter\Model;

class Voucher_Model extends Model
{
    protected $table = 'vouchers';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
