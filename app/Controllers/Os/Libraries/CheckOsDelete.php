<?php

namespace App\Controllers\Os\Libraries;

use App\Models\Os\OsRegister_Model;

class CheckOsDelete extends OsRegister_Model
{

    public function check($osId, $modOsRegister = null)
    {
        return $modOsRegister->select("
                os.id           as osId,
                osProc.id       as osProcId,
                osStock.id      as osStockId,
                osCom.id        as osComId,
                osPartner.id    as osPartnerId,
                finLink.id      as finLinkId,
            ")
            ->where('os.id', $osId)
            ->join('os__procedure osProc',  'osProc.id_os = os.id',     'left')
            ->join('os__stock osStock',     'osStock.id_os = os.id',    'left')
            ->join('os__comiss osCom',      'osCom.id_os = os.id',      'left')
            ->join('os__partner osPartner', 'osPartner.id_os = os.id',  'left')
            ->join('fin__link finLink', 'finLink.id_targetId = os.id AND finLink.id_targetName = 1',  'left')
            ->first();
    }
}
