<?php

namespace App\Controllers\Procedure\Register;

use App\Controllers\FetchController;
use App\Models\Procedure\Procedure_Model;

class ProcedureRegister extends FetchController
{
    private $modProcedure;

    public function __construct()
    {
        $this->modProcedure = new Procedure_Model();
    }

    //:RETORNA CADASTRO DO PROCEDIMENTO
    public function getData($procedureId = null)
    {
        parent::initFetch('163P', false);

        $procedureId ??= $this->request->getVar("procedureId");
        $returnData = [];

        //:Busca "procedimento"
        $procedureData = $this->getProcedure($procedureId);

        //:Retorna "procedimento"
        $returnData['procedure'] = $procedureData;

        dieJson(200, $returnData);
    }

    //:RETORNA CADASTRO DO PACIENTE 
    private function getProcedure($procedureId)
    {
        $where['procedure.id'] =  $procedureId;
        $where['procedure.id_clinicMain'] =  session('clinic')['idMain'];

        $resp =  $this->modProcedure
            ->select("
                procedure.*,
                procedure.updated_at    as optLock,
                category.name           as categoryName
            ")
            ->where($where)
            ->join('procedure__category category', 'category.id = procedure.id_category', 'left')
            ->first();

        //:Se não encontrar procedimento -> retorna erro
        if (empty($resp))
            dieJson(456, 'WAU-0097');

        return $resp;
    }

    //:SALVA DADOS DO PROCEDIMENTO
    public function setProcedure()
    {
        $optLock = parent::initFetch('164P', true);

        $dbInput = $this->request->getVar('data');
        $dbProcedure = $dbInput->procedure;
        $procedureId = $dbProcedure->id;

        unset($dbProcedure->categoryName);

        //:Valida acesso ao procedimento
        if ((int) $procedureId > 0) {
            //:Busca "procedimento" e verifica se existe
            $procedureData =  $this->modProcedure->select("id, id_clinic, id_clinicMain")->find($procedureId);
            if (empty($procedureData))
                dieJson(458, 'WAU-0158');

            if ($procedureData->id_clinic != session('clinic')['id'])
                dieJson(458, 'WAU-0159');
        }

        //:Valida valores numéricos
        if (!empty($dbProcedure->vl_table))
            $dbProcedure->vl_table = numberConvertDb($dbProcedure->vl_table);

        //:Salva procedimento
        $procedureId = $this->modProcedure->saveWau($dbProcedure, $optLock);

        $this->getData($procedureId);
    }
}
