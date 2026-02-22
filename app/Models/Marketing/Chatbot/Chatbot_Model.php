<?php

namespace App\Models\Marketing\Chatbot;

use App\Libraries\Models\WauModel;

class Chatbot_Model extends WauModel
{
    protected $table = 'chatbot';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
}
