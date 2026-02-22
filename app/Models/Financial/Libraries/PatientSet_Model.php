<?php

namespace App\Models\Financial\Libraries;

class PatientSet_Model
{
    public static function set(string $optLock, int $osId, int $patientId, object $dataFetch, object $models)
    {
        if ($patientId < 1)
            dieJson(454, 'WAU-0194');

        //:Busca e valida "os"
        $osData = $models->modOs
            ->select("
                os.id_clinic,
                patient.id as patientId,
                patient.updated_at,
                patient.balance_os,
                patient.balance_paid,
                patient.balance_total,
            ")
            ->join('patient', 'patient.id = os.id_patient')
            ->where('os.id', $osId)
            ->first();
        if (!$osData)
            dieJson(456, 'WAU-0198');
        if ($osData->id_clinic != session('clinic')['id'])
            dieJson(468, 'WAU-0196');
        if ($osData->patientId != $patientId)
            dieJson(458, 'WAU-0197');
        if ($osData->updated_at !== $optLock)
            dieJson(458, 'WAU-0195');

        //:Atualiza saldo do paciente
        $balance_os = $osData->balance_os;
        $balance_paid = $osData->balance_paid;
        $fetchValue = numberConvertDb($dataFetch->objValue);
        $balance_paid = $balance_paid + $fetchValue;
        $balance_total =  $balance_paid - $balance_os;

        //:Inicia movimentação no BD
        $db = \Config\Database::connect();
        $db->transException(true);
        $db->transBegin();

        try {
            //:Atualiza saldo do "paciente"
            if (!$models->modPatient->protect(false)->update($patientId, [
                'balance_paid' => $balance_paid,
                'balance_total' => $balance_total
            ])) {
                throw new \Exception();
            }

            //:Salva "content"
            if (!$models->modFinContent->protect(false)->save([
                'id_clinic' => session('clinic')['id'],
                'date' => $dataFetch->objDate,
                'text' => $dataFetch->objDescription,
                'value' => $fetchValue,
                'status' => $dataFetch->objStatusId,
            ])) {
                throw new \Exception();
            }
            $newId = $models->modFinContent->getInsertID();

            //:Salva link1 -> OS
            if (!$models->modFinLink->protect(false)->save([
                'id_content' => $newId,
                'id_targetName' => 1,
                'id_targetId' => $osId,
                'id_targetSecondary' => $patientId,
                'sign' => 1,
            ])) {
                throw new \Exception();
            }

            //:Salva link2 -> Banco
            if (!$models->modFinLink->protect(false)->save([
                'id_content' => $newId,
                'id_targetName' => $dataFetch->idTargetName,
                'id_targetId' => $dataFetch->idTargetId,
                'id_targetSecondary' => $patientId,
                'sign' => 1,
            ])) {
                throw new \Exception();
            }

            $db->transCommit();
        } catch (\Throwable $e) {
            $db->transRollback();
            dieJson(500, $e->getMessage() . " - WAU-0189");
        }
    }
}
