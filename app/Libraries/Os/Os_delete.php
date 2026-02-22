<?php

namespace App\Libraries\Os;

use App\Models\Archives_Model;
use App\Models\Bank\Bank_link_Model;
use App\Models\Os\Os_register_Model;
use App\Models\Patient_status_Model;

class Os_delete
{
    /**
     * Métoto para deletar uma OS
     */
    public static function delete($osId)
    {
        validate($osId, '*erro: #608');

        $modArchives = new Archives_Model();
        $modBank = new Bank_link_Model();
        $modOs = new Os_register_Model();
        $modStatus = new Patient_status_Model();

        //DELETA OS_STATUS_OBS
        $deleteStatus = $modStatus
            ->where('id_table', $osId)
            ->where('id_tableName', 8)
            ->delete();

        //ARQUIVOS
        //
        //BUSCA ARQUIVOS
        $archiveList = $modArchives
            ->where('id_table', $osId)
            ->where('id_tableName', 8)
            ->findAll();
        //
        //DELETA ARQUIVOS
        if ($archiveList) {
            //DELETA ARQUIVOS DA PASTA
            foreach ($archiveList as $r) {
                $arq = "data/patient/{$r['name']}.{$r['extension']}";
                if (file_exists($arq)) {
                    unlink($arq);
                } else {
                    dieJson(999, 'erro: 43126');
                }
            }
            //
            //DELETA ARQUIVOS DA TABELA
            $deleteArchive = $modArchives
                ->where('id_table', $osId)
                ->where('id_tableName', 8)
                ->delete();
        }

        //VERIFICA SE EXISTEM LANÇAMENTOS EM BANCO
        $bankList = $modBank
            ->where('id_destination', $osId)
            ->where('id_destination_table', 9)
            ->findAll();
        //
        validate($bankList, 'Existem lançamentos no financeiro!', 'false');

        //DELETA OS
        $modOs->delete($osId);

        return 200;
    }
}
