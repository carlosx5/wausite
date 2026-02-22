<?php

namespace App\Controllers\Provider\Register;

use App\Controllers\BaseController;
use App\Models\Provider\Provider_register_Model;

class Register extends BaseController
{
    public function __construct()
    {
        $this->modProvider = new Provider_register_Model();
    }

    /**
     * Método formação de tela PC
     */
    public function index()
    {
        $uri = $this->initBackend(87);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Fornecedores',
            'viewTitle' => 'Cadastro de Fornecedores',
            'contenList' => ['provider/register/sidebar'],
        ]);

        $data = $this->dataCreate(
            $uri,
            "factory/zipFactory,{$uri}",
            'provider_register'
        );

        return (viewShow($uri, $data));
    }

    /**
     * Métoto para buscar dados
     */
    public function get_data()
    {
        $providerId = $this->initFetch(87, 'providerId');

        //BUSCA DADOS DO FORNECEDOR
        $data['providerRegister'] = $this->get_providerRegister($providerId);

        return $this->json(200, $data);
    }

    /**
     * Métoto para buscar dados do fornecedor
     */
    private function get_providerRegister($providerId)
    {
        return $this->modProvider->find($providerId);
    }

    /**
     * Métoto para gerar busca do fornecedor
     */
    public function find_provider()
    {
        $this->initFetch(88);

        $find = $this->request->getVar('find');

        $data['list'] = $this->modProvider
            ->select('id, name_short as col1')
            ->like('name_short', $find, 'LEFT')
            ->orderBy('name_short')
            ->get()
            ->getResultArray();

        return $this->json(200, $data);
    }

    /**
     * Métoto para salvar fornecedor
     */
    public function save_providerRegister()
    {
        $providerId = $this->initFetch(89, 'providerId');
        helper('validate');

        //DATA
        $data = $this->request->getVar('data');
        //
        $data->id = $providerId;

        //VALIDAÇÃO
        validate($data->name, 'nome');
        validate($data->name_short, 'nome curto');

        //SALVA
        $providerId = $this->modProvider->saveWau($data);

        return $this->json(200, ['providerRegister' => $this->get_providerRegister($providerId)]);
    }
}
