<?php

namespace App\Models\Financial\Libraries;

class OsSet_Model
{
    public static function set(int $patientId, object $models)
    {
        if ($patientId < 1)
            dieJson(454, 'WAU-0194');

        $patientData = $models->modPatient
            ->select("id, balance_os, balance_paid, balance_total")
            ->where("id", $patientId)
            ->first();
        if (!$patientData)
            dieJson(465, 'WAU-0200');

        $osList = $models->modOs
            ->select("id, vl_invoiceTotal")
            ->where('id_patient', $patientId)
            ->findAll();

        $financialOsSum = 0;
        foreach ($osList as $os) {
            $financialOsSum += $os->vl_invoiceTotal;
        }

        if ($patientData->balance_os == $financialOsSum) {
            return;
        }

        $models->modPatient->protect(false)->update($patientId, [
            'balance_os' => $financialOsSum,
            'balance_total' => $patientData->balance_paid - $financialOsSum,
        ]);
    }
}
