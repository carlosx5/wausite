<?php

namespace App\Controllers\Report\Service\List;

use App\Controllers\FetchController;
use App\Controllers\Record\Libraries\RecordCheckPending;
use App\Models\Os\OsRegister_Model;
use App\Models\Record\Register\RecordRegister_Model;

class ReportServiceList extends FetchController
{
    private $modOs;

    public function __construct()
    {
        $this->modOs = new OsRegister_Model();
    }

    //:RETORNA FETCH COM LISTA DE OS
    public function getData()
    {
        parent::initFetch('170P', false);

        $libRecordCheckPending = new RecordCheckPending();

        $dtTarget = $this->request->getVar('dtTarget');
        $dtStart = $this->request->getVar('dtStart');
        $dtEnd = $this->request->getVar('dtEnd');
        $statusId = $this->request->getVar('statusId');
        $profId = $this->request->getVar('profId');
        $clinicId = $this->request->getVar('clinicId');
        $order = $this->request->getVar('order');
        $returnData = [];

        //:Retorna lista de serviços
        $returnData['osList'] = $this->getOsList(
            $dtTarget,
            $dtStart,
            $dtEnd,
            $statusId,
            $profId,
            $clinicId,
            $order
        );

        //:Verifica se há prontuários pendentes para o usuário logado
        $returnData['checkPendingRecord'] = $libRecordCheckPending->checkPendingRecord(new RecordRegister_Model());

        dieJson(200, $returnData);
    }

    private function getOsList($dtTarget, $dtStart, $dtEnd, $statusId, $profId, $clinicId, $order)
    {
        //:Redefine valor para $dtTarget
        $dtTarget = $dtTarget === 'calendar' ? 'calendar_start' : 'created_at';
        $dtTarget = "os.$dtTarget";

        //:Redefine valor para $order
        $order = strtoupper((string) $order);
        $order = \in_array($order, ['ASC', 'DESC'], true) ? $order : 'DESC';

        //:Inicia filtro
        $where = [];

        //:Filtro clínica matriz
        $where['os.id_clinicMain'] = session('clinic')['idMain'];

        //:Filtro clínica
        $where['os.id_clinic'] = $clinicId ?: session('clinic')['id'];
        ///
        //:Se não tem permissão para ver todas as clínicas, força filtro pela clínica da sessão
        $where['os.id_clinic'] = !hasPermission('156P') ? $where['os.id_clinic'] : session('clinic')['id'];

        //:Filtro período
        if (!empty($dtStart) && !empty($dtEnd)) {
            $where["$dtTarget >="] =  "$dtStart 00:00:00";
            $where["$dtTarget <="] =  "$dtEnd 23:59:59";
        }

        //:Filtro status
        if (!empty($statusId)) {
            $where['os.id_status'] = $statusId;
        }

        //:Filtro profissional
        if (!hasPermission('165P')) {
            //:Se não tem permissão para ver todos profissionais, força filtro pelo profissional da sessão
            $where['os.id_prof'] = session()->log_userId;
        } else {
            //:Aplica filtro pelo profissional selecionado
            if (!empty($profId))
                $where['os.id_prof'] = $profId;
        }

        $resp = $this->modOs
            ->select("
                os.id                                               as osId,
                os.id_patient                                       as patientId,
                os.id_clinic                                        as clinicId,
                IFNULL(os.id_status, 10)                            as recordStatus,
                os.created_at                                       as createdAt,
                os.calendar_start                                   as calendarStart,
                os.calendar_end                                     as calendarEnd,
                patient.id                                          as patientId,
                patient.name_social                                 as patientName,
                procedure.id                                        as procedureId,
                procedure.name                                      as procedureName,
                prof.id                                             as profId,
                CONCAT_WS(' ', prof.name_prefix, prof.name_social)  as profName,
                record.id                                           as recordId,
                record.id_pending                                   as recordIdPending,
                status.name                                         as statusName,
                cl.name_social                                      as clinicName,
            ")
            ->where($where)
            ->join('patient', 'patient.id = os.id_patient', 'left')
            ->join('procedure', 'procedure.id = os.id_procedureMain', 'left')
            ->join('user prof', 'prof.id = os.id_prof', 'left')
            ->join('os__status as status', 'status.id = os.id_status', 'left')
            ->join('record', 'record.id_os = os.id', 'left')
            ->join('clinic cl', 'cl.id = os.id_clinic', 'left')
            ->orderBy($dtTarget, $order)
            ->findAll(30);

        return $resp;
    }
}
