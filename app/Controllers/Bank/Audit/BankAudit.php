<?php

namespace App\Controllers\Bank\Audit;

use App\Controllers\BaseController;
use App\Models\Bank\Bank_link_Model;
use App\Models\Bank\BankAudit_Model;
use App\Models\Clinic_register_Model;
use App\Models\User\User_employee_Model;
// use App\Models\User\User_register_Model;

class BankAudit extends BaseController
{
    private $modBankAudit;
    private $modBankLink;
    private $modClinic;
    private $modEmployee;
    private $modUser;
    private $lastIdAudit;

    public function __construct()
    {
        $this->modBankAudit = new BankAudit_Model();
        $this->modBankLink = new Bank_link_Model();
        $this->modClinic = new Clinic_register_Model();
        $this->modEmployee = new User_Employee_Model();
        // $this->modUser = new User_register_Model();
    }

    /** //-INDEX */
    public function index()
    {
        $this->initBackend(9);

        //:SIDEBAR
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Financeiro',
            'viewTitle' => 'Financeiro',
            'contenList' => [],
        ]);

        //:URI
        $uri = uri_string();

        //:DATA
        $data = $this->dataCreate(
            $uri,
            $uri,
            'bank_check'
        );

        //:VIEW
        return viewShow($uri, $data);
    }

    /** //+BUSCA SALDO DE TODAS AS TABELAS */
    public function get()
    {
        $this->initFetch(9);

        //:DATA-AUDIT
        $data['audit'] = $this->modBankAudit->orderBy('id', 'DESC')->first();

        if ($data['audit']) {
            $this->lastIdAudit = $data['audit']->lastIdAudit;
        } else {
            $this->lastIdAudit = 0;
            $data['audit'] ??= ['lastId' => 0];
        }

        //:DATA-NEW
        $data['new']['collectorNew'] = $this->getByTable(3) * -1;
        $data['new']['providerNew'] = $this->getByTable(7) * -1;
        $data['new']['stampNew'] = $this->getByTable(8) * -1;
        $data['new']['doctorNew'] = $this->getByTable(5) * -1;
        $data['new']['agentNew'] = $this->getByTable(6) * -1;
        $data['new']['osNew'] = $this->getByTable(9) * -1;
        $data['new']['clinicNew'] = $this->getByTable(1) * -1;
        $data['new']['loanNew'] = $this->getByTable(13);
        $data['new']['bankEntriesNew'] = $this->getByTable(10);
        $data['new']['userNew'] = $this->getByTable(11) * -1;
        $data['new']['notIdentifiedNew'] = $this->getByTable(996) * -1;
        $data['new']['lastIdNew'] = $this->modBankLink
            ->orderBy('id', 'DESC')
            ->first()['id'];

        //:DATA-STATUS
        $data['status'] = 200;

        return $this->json(200, $data);
    }

    /** //-BUSCA SALDO DE TABELA ESPECIFICA
     * @param mixed $table
     * @return float
     */
    private function getByTable($table)
    {
        //VALOR POSITIVO
        $sumP = $this->modBankLink
            ->select('SUM(bank.value) as sumP')
            ->where('bank_link.id >', $this->lastIdAudit)
            ->where('id_destination_table', $table)
            ->where('bank_link.positive', 1)
            ->join('bank', 'bank.id = bank_link.id_bank')
            ->findAll()[0]['sumP'];

        //VALOR NEGATIVO
        $sumN = $this->modBankLink
            ->select('SUM(bank.value) as sumN')
            ->where('bank_link.id >', $this->lastIdAudit)
            ->where('id_destination_table', $table)
            ->where('bank_link.positive', 2)
            ->join('bank', 'bank.id = bank_link.id_bank')
            ->findAll()[0]['sumN'];

        //RETORNA SOMA
        return round($sumP - $sumN, 2);
    }

    /** //+BUSCA LISTA DE DETERMINADA TABELA */
    public function getListByTable()
    {
        $tableId = $this->initFetch(9, 'tableId');

        $data['list'] = $this->modBankLink
            ->select('
                bank.id,
                bank.date,
                bank.value,
                bank_link.positive,
            ')
            ->where('id_destination_table', $tableId)
            ->where('bank_link.positive', 1)
            ->join('bank', 'bank.id = bank_link.id_bank')
            ->findAll();

        return $this->json(200, $data);
    }

    /** //+SALVA NOVA AUDITORIA */
    public function saveNewAudit()
    {
        $this->initFetch(9);

        $fields = $this->request->getVar('fields');
        $fields->date = date('Y-m-d H:i:s');

        $this->modBankAudit->protect(false)->save($fields);

        return $this->json(200, $fields);
    }

    /** //+DELETA AUDITORIA */
    public function deleteAudit()
    {
        $this->initFetch(9);

        $auditId = $this->request->getVar('auditId');

        $resp = $this->modBankAudit->protect(false)->delete($auditId);

        return $this->json(200, $resp);
    }
}
