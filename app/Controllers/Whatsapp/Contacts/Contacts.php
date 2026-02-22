<?php

namespace App\Controllers\Whatsapp\Contacts;

use App\Controllers\BaseController;
use App\Models\Whatsapp\Contacts\Contacts_Model;

class Contacts extends BaseController
{
    public function __construct()
    {
        $this->modContacts = new Contacts_Model();
    }

    /**
     * Métoto para atualizar contatos
     */
    public function refreshContacts()
    {
        //URL: whatsapp/contacts/contacts/refreshcontacts
        $this->initFetch(9);

        $resp = $this->modContacts->refreshContacts();

        return $this->response->setJSON($resp);
    }
}
