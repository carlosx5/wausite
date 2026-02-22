<?php

namespace App\Models\User\Invite;

use CodeIgniter\Model;

class Invite_link_Model extends Model
{
    protected $table = 'invites_link';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
