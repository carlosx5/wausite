<?php

namespace App\Models\Whatsapp\Contact;

use CodeIgniter\Model;

class ZapContact_Model extends Model
{
    protected $table = 'whatsapp_contacts';
    protected $primaryKey = 'id';
    protected $returnType = 'object';

    /**//*PEGA A ULTIMA ORDENAÇÃO GERAL*/
    public function getLastOrd()
    {
        $resp = $this->select('ord')->orderBy('ord DESC')->first();

        return $resp ? $resp->ord : 0;
    }

    /**//*PEGA A ULTIMA ORDENAÇÃO DE UM CONTATO*/
    public function getLastOrdContact($lastOrd)
    {
        $resp = $this->select('ord')->where('ord', $lastOrd)->orderBy('ord DESC')->first();

        return $resp ? $resp->ord : 0;
    }
}
