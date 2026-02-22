<?php

namespace App\Models\Whatsapp\Message;

use CodeIgniter\Model;

class ZapMessage_Model extends Model
{
    protected $table = 'whatsapp_messages';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
