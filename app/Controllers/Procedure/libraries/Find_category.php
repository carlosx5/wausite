<?php

namespace App\Controllers\Procedure\Libraries;

use App\Controllers\FetchController;
use App\Models\Procedure\Category_Model;

class Find_category extends FetchController
{
    //:RETORNA REQUEST DE BUSCA DE ESTOQUE
    public function find()
    {
        parent::initFetch('999P', false);

        $find = $this->request->getVar('find') ?? ' ';

        $modCategory = new Category_Model();

        $data['list'] = $modCategory
            ->select('id, name')
            ->like('name', $find, 'after')
            ->orderBy('CASE WHEN id = 14 THEN 1 ELSE 0 END', 'ASC', false)
            ->orderBy('name', 'ASC')
            ->findAll(15);

        dieJson(200, $data);
    }
}
