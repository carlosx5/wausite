<?php

namespace App\Controllers\Report\Os\List;

use App\Controllers\FetchController;
use App\Models\Os\OsRegister_Model;

class ReportOsList extends FetchController
{
    private $modOs;

    public function __construct()
    {
        $this->modOs = new OsRegister_Model();
    }

    //:RETORNA FETCH COM LISTA DE OS
    public function getData()
    {
        parent::initFetch('120P', false);

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
        $where['os.id_clinic'] = !hasPermission('126P') ? $where['os.id_clinic'] : session('clinic')['id'];

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
        if (!hasPermission('125P')) {
            //:Se não tem permissão para ver todos profissionais, força filtro pelo profissional da sessão
            $where['os.id_prof'] = session()->log_userId;
        } else {
            //:Aplica filtro pelo profissional selecionado
            if (!empty($profId))
                $where['os.id_prof'] = $profId;
        }

        $resp = $this->modOs
            ->select("
                os.id,
                os.created_at       as createdAt,
                os.calendar_start   as calendarStart,
                pa.id               as patientId,
                pa.name             as patientName,
                pr.name             as procedureName,
                prof.name_social    as profName,
                cl.name_social      as clinicName,
                st.name             as statusName
            ")
            ->where($where)
            ->join('patient pa', 'pa.id = os.id_patient', 'left')
            ->join('user prof', 'prof.id = os.id_prof', 'left')
            ->join('procedure pr', 'pr.id = os.id_procedureMain', 'left')
            ->join('clinic cl', 'cl.id = os.id_clinic', 'left')
            ->join('os__status st', 'st.id = os.id_status', 'left')
            ->orderBy($dtTarget, $order)
            ->findAll(15);

        //:Lista não existe
        if (empty($resp))
            dieJson(456, 'WAU-0088');

        return $resp;
    }
}
