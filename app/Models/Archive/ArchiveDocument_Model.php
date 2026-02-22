<?php

namespace App\Models\Archive;

use CodeIgniter\Model;

class ArchiveDocument_Model extends Model
{
    protected $table = 'archive__document';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
