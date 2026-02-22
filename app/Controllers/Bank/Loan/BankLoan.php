<?php

namespace App\Controllers\Bank\Loan;

use App\Controllers\BaseController;
use App\Models\Bank\Loan\BankLoan_Model;

class BankLoan extends BaseController
{
    private $modLoan;

    public function __construct()
    {
        $this->modLoan = new BankLoan_Model();
    }

    /** //-TELA */
    public function index()
    {
        $this->initBackend(9);

        //:SIDEBAR
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Financeiro',
            'viewTitle' => 'Empréstimo',
            'contenList' => ['bank/loan/sidebar'],
        ]);

        //:URI
        $uri = uri_string();

        //:DATA
        $data = $this->dataCreate(
            $uri,
            $uri,
            'bank_loan'
        );

        //:VIEW
        return viewShow($uri, $data);
    }

    /** //+BUSCA CADASTRO E LISTA */
    public function getData($registerId = false)
    {
        if (!$registerId) {
            $registerId = $this->initFetch(9, 'registerId');
        };

        $data['register'] = $this->getRegister($registerId);
        $data['list'] = $this->getList($registerId);

        return $this->json(200, $data);
    }

    /** //-BUSCA CADASTRO
     * @param mixed $registerId
     * @return object|null
     */
    private function getRegister($registerId)
    {
        return $this->modLoan
            ->select('bank_loan.*, clinics.name_short as nm_clinic, bn.name_short as nm_bank')
            ->join('clinics', 'clinics.id = bank_loan.id_clinic', 'LEFT')
            ->join('bank_name bn', 'bn.id = bank_loan.id_bank', 'LEFT')
            ->find($registerId);
    }

    /** //-BUSCA LISTA
     * @param mixed $registerId
     * @return array
     */
    private function getList($registerId)
    {
        return $this->modLoan->getList($registerId);
    }

    /** //+SALVA CADASTRO */
    public function saveRegister()
    {
        $registerId = $this->initFetch(9, 'registerId');

        //:DATA
        $data = $this->request->getVar('data');
        $data->id = $registerId;
        unset(
            $data->nm_clinic,
            $data->nm_bank,
        );

        //:SALVA
        $registerId = $this->modLoan->saveWau($data);

        return $this->json(200, ['register' => $this->getRegister($registerId)]);
    }

    /** //+LANÇA DEBITO NA LISTA */
    public function launchLoan()
    {
        $registerId = $this->initFetch(9, 'registerId');

        //:DATA
        $data =  $this->request->getVar('data');
        $data = json_decode(json_encode($data), true);

        //:CRIA LISTA
        $modBank = new \App\Models\Bank\Entry\EntryAdd_Model();
        $modBank->entryAdd($data);

        //:ALTERA STATUS = 1
        $this->modLoan->saveWau(['id' => $registerId, 'status' => 1]);

        return $this->json(200);
    }
}
