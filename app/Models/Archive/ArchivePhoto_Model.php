<?php

namespace App\Models\Archive;

use CodeIgniter\Model;

class ArchivePhoto_Model extends Model
{
    protected $table = 'archive__photo';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
