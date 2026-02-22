<?php

namespace App\Controllers\Procedure\PriceList;

use App\Controllers\BaseController;
use App\Models\Procedure\PriceList\PriceList_Model;

class PriceList extends BaseController
{
    public function __construct()
    {
        $this->modPriceList = new PriceList_Model();
    }

    /**
     * Método formação de tela PC
     */
    public function index()
    {
        $this->initBackend(163);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Procedimentos',
            'viewTitle' => 'Tabela de Preços',
            'contenList' => ['procedure/priceList/sidebar'],
        ]);

        $uri = uri_string();
        $data = $this->dataCreate($uri, $uri, 'priceList');

        return (viewShow($uri, $data));
    }

    /**
     * Métoto para buscar tabela de preço
     */
    public function getPrice($id = false)
    {
        if (!$id) {
            $id = $this->initFetch(163, 'id');
        }
        ;

        $data['price'] = $this->modPriceList
            ->select('id, name, price_list')
            ->find($id);

        return $this->json(200, $data);
    }

    /**
     * Métoto para salvar tabela de preço
     */
    public function updatePrice()
    {
        $id = $this->initFetch(164, 'id');

        //DATA
        $data['id'] = $id;
        $data['price_list'] = $this->request->getVar('priceList');

        //SALVA
        $resp = $this->modPriceList->protect(false)->save($data);

        $this->getPrice($id);
    }

    /**
     * Métoto para buscar lista de procedimentos
     */
    public function findProcedure()
    {
        $this->initFetch(163);

        $find = $this->request->getVar('find');

        $data['list'] = $this->modPriceList
            ->select('id, name as col1')
            ->like('name', $find, 'LEFT')
            ->where('id_clinic', session()->clinic['id'])
            ->orderBy('name')
            ->limit(20)
            ->findAll();

        return $this->json(200, $data);
    }
}
