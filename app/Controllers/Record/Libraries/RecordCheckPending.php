<?php

namespace App\Controllers\Record\Libraries;

class RecordCheckPending
{
    //:VERIFICA SE EXISTE PRONTUÁRIO PENDENTE
    public function checkPendingRecord($modRecord)
    {
        $logId = session()->get('log_userId');

        //:Busca prontuário pendente
        $resp = $modRecord
            ->select('id')
            ->where('id_pending', $logId)
            ->first();

        //:Se não houver prontuário pendente, retorna nulo
        if (empty($resp->id))
            return null;

        //:Seta cookie com o id do prontuário pendente
        helper('cookie');
        setCook('pendingRecord', $resp->id);

        //:Retorna id do prontuário pendente
        return $resp->id;
    }
}
