<?php

namespace App\Models\Financial\Libraries;

class PatientDel_Model
{
    public static function del(string $optLock, int $contentId, int $patientId, object $models)
    {
        if ($contentId < 1 || $patientId < 1)
            dieJson(454, 'WAU-0194');

        //:Busca "paciente"
        $patientData = $models->modPatient->where('id', $patientId)->first();

        //:Valida optLock
        if ($patientData->updated_at !== $optLock)
            dieJson(458, 'WAU-0195');

        //:Valida acesso ao paciente
        if ($patientData->id_clinic != session('clinic')['id'])
            dieJson(468, 'WAU-0193');

        //:Atualiza saldo do paciente
        $contentData = $models->modFinContent->where('id', $contentId)->first();
        $balance_os = $patientData->balance_os;
        $balance_paid = $patientData->balance_paid;
        $fetchValue = (float) $contentData->value;
        $balance_paid = $balance_paid - $fetchValue;
        $balance_total =  $balance_paid - $balance_os;

        //:Inicia transação
        $db = \Config\Database::connect();
        $db->transException(true);
        $db->transBegin();

        try {
            if (!$models->modPatient->protect(false)->update($patientData->id, [
                'balance_paid' => $balance_paid,
                'balance_total' => $balance_total
            ])) {
                throw new \Exception();
            }

            //:Exclui "content"
            if (!$models->modFinContent->protect(false)->delete($contentId)) {
                throw new \Exception();
            }

            //:Exclui "link"
            if (!$models->modFinLink->protect(false)->where('id_content', $contentId)->delete()) {
                throw new \Exception();
            }

            $db->transCommit();
        } catch (\Throwable $e) {
            $db->transRollback();
            dieJson(500, $e->getMessage() . "- WAU-0192");
        }
    }
}
