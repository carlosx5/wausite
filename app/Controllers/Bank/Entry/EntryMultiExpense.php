<?php

namespace App\Controllers\Bank\Entry;

use App\Controllers\BaseController;
use App\Models\Bank\Entry\EntryAdd_Model;
use App\Models\Bank\Bank_name_Model;

class EntryMultiExpense extends BaseController
{
    private $modBankName;
    private $modEntryAdd;
    private $idMultiEntry;

    public function __construct()
    {
        $this->modBankName = new Bank_name_Model();
        $this->modEntryAdd = new EntryAdd_Model();
    }

    //+FAZ LANÇAMENTOS
    public function entryAdd()
    {
        $this->initFetch(9);
        helper('validate');

        $data = $this->request->getVar();

        //*VERIFICA SE ESSA CLÍNICA POSSUI BANCO DE LANÇAMENTOS MÚLTIPLOS
        // $clinicId = session()->clinic['id'];
        // $idMultiEntry = $this->modBankName->where("Adm = 2 AND id_clinic = $clinicId")->first();
        $idMultiEntry = $this->modBankName->where("Adm = 2")->first(); //LIBEREI P/ TODAS AS CLINICAS
        validate($idMultiEntry, '*Clínica não possue conta de Lançamentos Múltiplos');
        $this->idMultiEntry = $idMultiEntry->id;

        //*VALIDAÇÃO DE BANCO
        //
        //*LISTA EXISTE
        if (!isset($data->listIn[0]))
            dieJson(999, 'Nenhum banco inserido!');
        //
        //*CHEGA PARAMETROS
        foreach ($data->listIn as $key => $bank) {
            validate($bank->table, 'banco/tabela');
            validate($bank->id, 'banco/id');
            validate($bank->date, 'banco/data');
            validate($bank->val, 'banco/valor');
        }

        //*VALIDAÇÃO DE SAÍDA
        //
        //*LISTA EXISTE
        if (!isset($data->listOut[0]))
            dieJson(999, 'Nenhuma saída inserida!');
        //
        //*CHEGA PARAMETROS
        foreach ($data->listOut as $key => $out) {
            if ($out->table == 9) { //OS
                validate($out->id, 'Os/id');
                validate($out->val, 'Os/valor');
                validate($out->month, 'Os/mes');
            } elseif ($out->table == 1) { //CLÍNICA
                validate($out->id, 'despesa/id');
                validate($out->val, 'despesa/valor');
                validate($out->description, 'despesa/descricao');
            } else { //ERRO
                dieJson(999, '*Erro na lista de saída!');
            }
        }

        //*FAZ LANÇAMENTOS DE ENTRADA
        $this->addIn($data->listIn);

        //*FAZ LANÇAMENTOS DE SAÍDA
        $this->addOut($data->listOut);

        dieJson(200);
    }

    //-ENTRADA
    private function addIn($data)
    {
        foreach ($data as $key => $bank) {
            $month = date('Y-m', strtotime($bank->date));

            $entryData = [
                'id_clinic' => session()->clinic['id'],
                'id_source' => 16,
                'source_category' => 0,
                'description' => 'Lançamentos múltiplos',
                'date' => $bank->date,
                'value' => $bank->val,
                'available' => 1,
                'month' => $month,
                'links' => [
                    [
                        'destination' => $this->idMultiEntry,
                        'table' => 10,
                        'positive' => 2,
                    ],
                    [
                        'destination' => $bank->id,
                        'table' => 10,
                        'positive' => 1,
                    ],
                ],
            ];

            $this->modEntryAdd->entryAdd($entryData);
        }
    }

    //-SAIDA
    private function addOut($data)
    {
        foreach ($data as $key => $out) {
            $acting = $out->table; //*9 = OS | 1 = CLINICA

            //*bank
            $month = ($acting == 9) ? $out->month : date('Y-m', strtotime('now'));
            $today = date('Y-m-d H:i:s', strtotime('now'));
            $description = ($acting == 9)
                ? "OS #{$out->id}; Depósito #{$this->idMultiEntry} Múltiplos"
                : $out->description;
            $idSource = ($acting == 9) ? 8 : 4;
            $idSourceCategory = ($acting == 9) ? 0 : $out->id;

            //*bank_link
            $idDestination = ($acting == 9) ? $out->id : session()->clinic['id'];
            $idDestinationTable = ($acting == 9) ? 9 : 1;
            $positive = ($acting == 9) ? 1 : 2;

            $entryData = [
                'id_clinic' => session()->clinic['id'],
                'id_source' => $idSource,
                'source_category' => $idSourceCategory,
                'description' => $description,
                'date' => $today,
                'value' => $out->val,
                'available' => 1,
                'month' => $month,
                'links' => [
                    [
                        'destination' => $this->idMultiEntry,
                        'table' => 10,
                        'positive' => $positive,
                    ],
                    [
                        'destination' => $idDestination,
                        'table' => $idDestinationTable,
                        'positive' => $positive,
                    ],
                ],
            ];

            $this->modEntryAdd->entryAdd($entryData);
        }
    }

    //+BUSCA OS
    public function getOs()
    {
        $osId = $this->initFetch(9, 'osId');
        helper('validate');

        $modOs = new \App\Models\Os\Os_register_Model();

        $data['os'] = $modOs
            ->select('os_old.id, os_old.vl_reimbursement, os_old.month, os_old.status_next, pa.name')
            ->join('patient pa', 'pa.id = os_old.id_patient')
            ->find($osId);

        validate($data['os'], "*Os {$osId} não foi localizada!");
        validate($data['os']['vl_reimbursement'] > 0, "*Os {$osId} não possue valor de reembolso!");
        validate($data['os']['status_next'] < 90, "*Os {$osId} já possue fechamento!");

        return $this->json(200, $data);
    }
}
