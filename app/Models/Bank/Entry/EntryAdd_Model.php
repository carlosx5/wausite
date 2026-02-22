<?php

namespace App\Models\Bank\Entry;

use App\Models\Bank\Bank_Model;
use App\Models\Bank\Bank_name_Model;
use App\Models\Bank\Bank_link_Model;
use App\Models\Bank\Bank_balance_Model;
use App\Models\Bank\Bank_locked_day_Model;

class EntryAdd_Model
{
    private $modBank;
    private $modBankName;
    private $modBankLink;
    private $modBankBalance;
    private $modBankLockedDay;

    public function __construct()
    {
        $this->modBank = new Bank_Model();
        $this->modBankName = new Bank_name_Model();
        $this->modBankLink = new Bank_link_Model();
        $this->modBankBalance = new Bank_balance_Model();
        $this->modBankLockedDay = new Bank_locked_day_Model();
    }

    /** //-DA ENTRADA EM LANÇAMENTOS
     * @param array $data
     * @return void
     */
    public function entryAdd($data)
    {
        //:CHECA $DATA
        $check = ['id_clinic', 'id_source', 'description', 'date', 'value', 'available'];
        //
        for ($i = 0; $i < count($check); $i++) {
            if (array_key_exists($check[$i], $data)) {
                if (!$data[$check[$i]])
                    dieJson(999, "O campo {$check[$i]} é obrigatório!");
            } else {
                dieJson(999, 'Algum campo exigido não foi enviado!');
            }
        }

        //:VERIFICA SE O DIA ESTÁ BLOQUEADO (APENAS EM BANCO)
        $this->checkDateLocked([
            'date' => $data['date'],
            'banks' => [
                ['id' => $data['links'][0]['destination'], 'table' => $data['links'][0]['table']],
                ['id' => $data['links'][1]['destination'], 'table' => $data['links'][1]['table']],
            ],
        ]);

        //:COMPLEMENTA $DATA
        $data['id_login'] = session()->log_userId;
        $data['month'] = date('Y-m', strtotime($data['date']));
        $data['value'] = mask_val_1($data['value']);

        //:ENTRADA EM "bank"
        $this->modBank->protect(false)->save([
            'id_login' => session()->log_userId,
            'id_clinic' => $data['id_clinic'],
            'id_source' => $data['id_source'],
            'id_source_category' => $data['source_category'],
            'description' => $data['description'],
            'date' => $data['date'],
            'value' => $data['value'],
            'available' => $data['available'],
            'month' => $data['month'],
            'enable' => 1,
        ]);
        $newId = $this->modBank->getInsertID();

        //:TRABALHA LINKS
        foreach ($data['links'] as $link) {
            //:ATUALIZA VALOR TOTAL
            $params = [
                'source' => $link['destination'],
                'table' => $link['table'],
                'value' => $data['value'],
                'positive' => $link['positive'],
            ];
            $this->sumBalance($params);

            //:SALVA "bank_link"
            $this->entryBankLink($newId, $link);
        }
    }

    /** //-DA ENTRADA EM "bank_link"
     * @param int|string $newId
     * @param array $link
     * @return void
     */
    private function entryBankLink($newId, $link)
    {
        $this->modBankLink->protect(false)->save([
            'id_bank' => $newId,
            'id_destination' => $link['destination'],
            'id_destination_table' => $link['table'],
            'positive' => $link['positive'],
        ]);
    }

    /** //-ATUALIZA VALOR DE SALDO
     * @param array $params
     * @param bool $delete
     * @return void
     */
    private function sumBalance($params, $delete = false)
    {
        $balance = $this->modBankBalance
            ->select('id, count, value')
            ->where('id_source', $params['source'])
            ->where('id_table', $params['table'])
            ->first();

        if ($balance) {//:ATUALIZA
            $this->modBankBalance
                ->protect(false)
                ->update($balance->id, [
                    'count' => $balance->count + ($delete ? -1 : 1),
                    'value' => $balance->value + ($params['value'] * ($params['positive'] == 1 ? 1 : -1)),
                ]);
        } else {//:NOVO
            $this->modBankBalance
                ->protect(false)
                ->save([
                    'id_source' => $params['source'],
                    'id_table' => $params['table'],
                    'count' => 1,
                    'value' => $params['value'] * ($params['positive'] == 1 ? 1 : -1),
                ]);
        }
    }

    /** //-DELETAR LANÇAMENTO
     * @param int|string $bankId
     * @return void
     */
    public function entryDelete($bankId)
    {
        //:CHECA SE BANK EXISTE
        $bank = $this->modBank->find($bankId);
        if ($bankId != $bank['id'])
            dieJson(999, 'Banco não localizado!');

        //:VERIFICA SE O DIA ESTÁ BLOQUEADO (APENAS EM BANCO)
        $bankLink = $this->modBankLink->where('id_bank', $bankId)->find();
        $this->checkDateLocked([
            'date' => $bank['date'],
            'banks' => [
                ['id' => $bankLink[0]['id_destination'], 'table' => $bankLink[0]['id_destination_table']],
                ['id' => $bankLink[1]['id_destination'], 'table' => $bankLink[1]['id_destination_table']],
            ],
        ]);

        //:ATUALIZA VALOR TOTAL
        foreach ($bankLink as $key => $link) {
            $this->sumBalance([
                'source' => $link['id_destination'],
                'table' => $link['id_destination_table'],
                'value' => $bank['value'],
                'positive' => $link['positive'] == 1 ? 2 : 1,
            ], true);
        }

        //:DELETA LANÇAMENTOS EM "bank_link"
        $this->modBankLink
            ->where('id_bank', $bankId)
            ->delete();

        //:DELETA LANÇAMENTOS EM "bank"
        $this->modBank->delete($bankId);
    }

    /** //-VERIFICA ARRAY COM DATAS P/ VER SE ALGUMA ESTÁ BLOQUEADA
     * @param array $data
     * @return bool
     */
    private function checkDateLocked($data)
    {
        foreach ($data['banks'] as $banks) {
            if ($banks['table'] == 10) {
                //:CHECA SE A DATA ESTÁ BLOQUEADA
                $resp = $this->modBankLockedDay->checkLockedDay($data['date'], $banks['id']);

                //:SE LOCALIZAR DATA BLOQUEADA CANCELA LANÇAMENTO
                if ($resp) {
                    $dt = date('d/m/Y', strtotime($data['date']));
                    $bankName = $this->modBankName->find($banks['id'])->name_short;
                    dieJson(999, "Lançamento não pode ser realizado em data bloqueada!\n(Banco: {$bankName} - Data: {$dt})");
                }
            }
        }

        return true;
    }
}
