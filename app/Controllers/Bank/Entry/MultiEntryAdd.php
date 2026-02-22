<?php

namespace App\Controllers\Bank\Entry;

use App\Controllers\BaseController;
use App\Models\Bank\Entry\EntryAdd_Model;
use App\Models\Bank\Bank_name_Model;

class MultiEntryAdd extends BaseController
{
    private $modBankName;
    private $modEntryAdd;
    private $idMultiEntry;

    public function __construct()
    {
        $this->modBankName = new Bank_name_Model();
        $this->modEntryAdd = new EntryAdd_Model();
    }

    //-INDEX
    public function index()
    {
        $this->initBackend(9);

        $uri = uri_string();
        $data = $this->dataCreate(
            [$uri],
            [
                $uri,
                'factory/ajaxSelect',
            ],
            'multiEntry'
        );

        return viewShow($uri, $data);
    }

    //+FAZ LANÇAMENTOS
    public function entryAdd()
    {
        $this->initFetch(9);
        helper('validate');

        $data = $this->request->getVar();

        //*VERIFICA SE ESSA CLÍNICA POSSUI BANCO DE LANÇAMENTOS MÚLTIPLOS
        $clinicId = session()->clinic['id'];
        // $idMultiEntry = $this->modBankName->where("Adm = 2 AND id_clinic = $clinicId")->first();
        $idMultiEntry = $this->modBankName->where("Adm = 2")->first();//LIBEREI P/ TODAS AS CLINICAS
        validate($idMultiEntry, '*Clínica não possue conta de Lançamentos Múltiplos');
        $this->idMultiEntry = $idMultiEntry->id;

        //*VALIDAÇÃO DE BANCO
        //
        //*LISTA EXISTE
        if (!isset($data->listIn[0]))
            dieJson(999, 'Nenhum banco inserido!');
        //
        //*CHEGA PARAMETROS
        foreach ($data->listIn as $bank) {
            validate($bank->table, 'banco/tabela');
            validate($bank->id, 'banco/id');
            validate($bank->date, 'banco/data');
            validate($bank->value, 'banco/valor');
        }

        //*VALIDAÇÃO DE SAÍDA
        //
        //*LISTA EXISTE
        if (!isset($data->listOut[0]))
            dieJson(999, 'Nenhuma saída inserida!');
        //
        //*CHEGA PARAMETROS
        foreach ($data->listOut as $out) {
            if ($out->table == 9) {//OS
                validate($out->id, 'Os/id');
                validate($out->value, 'Os/valor');
                validate($out->month, 'Os/mes');
            } elseif ($out->table == 1) {//CLÍNICA
                validate($out->id, 'despesa/id');
                validate($out->value, 'despesa/valor');
                validate($out->description, 'despesa/descricao');
            } else {//ERRO
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
        foreach ($data as $bank) {
            $month = date('Y-m', strtotime($bank->date));

            $entryData = [
                'id_clinic' => session()->clinic['id'],
                'id_source' => 16,
                'source_category' => 0,
                'description' => 'Lançamentos múltiplos',
                'date' => $bank->date,
                'value' => $bank->value,
                'available' => 1,
                'month' => $month,
                'links' => [
                    [
                        'destination' => $this->idMultiEntry,
                        'table' => 10,
                        'positive' => $bank->value < 0 ? 1 : 2,
                    ],
                    [
                        'destination' => $bank->id,
                        'table' => 10,
                        'positive' => $bank->value < 0 ? 2 : 1,
                    ],
                ],
            ];

            $this->modEntryAdd->entryAdd($entryData);
        }
    }

    //-SAIDA
    private function addOut($data)
    {
        foreach ($data as $out) {
            $acting = $out->table;//*9 = OS | 1 = CLINICA

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
            // $positive = ($acting == 9) ? 1 : 2;
            $positive = $out->value < 0 ? 2 : 1;

            $entryData = [
                'id_clinic' => session()->clinic['id'],
                'id_source' => $idSource,
                'source_category' => $idSourceCategory,
                'description' => $description,
                'date' => $today,
                'value' => $out->value,
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
}
