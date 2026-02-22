<?php

namespace App\Controllers\Report\Patient\List;

use App\Controllers\FetchController;
use App\Models\Patient\Register\PatientRegister_Model;

class ReportPatientList extends FetchController
{
    private $modPatient;

    public function __construct()
    {
        $this->modPatient = new PatientRegister_Model();
    }

    //:RETORNA FETCH COM LISTA DE OS
    public function getData()
    {
        parent::initFetch('120P', false);

        $dtStart = $this->request->getVar('dtStart');
        $dtEnd = $this->request->getVar('dtEnd');
        $clinicId = $this->request->getVar('clinicId');
        $order = $this->request->getVar('order');
        $returnData = [];

        //:Retorna lista de serviços
        $returnData['patientList'] = $this->getPatientList(
            $dtStart,
            $dtEnd,
            $clinicId,
            $order
        );

        dieJson(200, $returnData);
    }

    private function getPatientList($dtStart, $dtEnd, $clinicId, $order)
    {
        //:Redefine valor para $order
        $order = strtoupper((string) $order);
        $order = \in_array($order, ['ASC', 'DESC'], true) ? $order : 'DESC';

        //:Inicia filtro
        $where = [];

        //:Filtro clínica matriz
        $where['patient.id_clinicMain'] = session('clinic')['idMain'];

        //:Filtro clínica
        $where['patient.id_clinic'] = $clinicId ?: session('clinic')['id'];
        ///
        //:Se não tem permissão para ver todas as clínicas, força filtro pela clínica da sessão
        $where['patient.id_clinic'] = !hasPermission('126P') ? $where['patient.id_clinic'] : session('clinic')['id'];

        //:Filtro período
        if (!empty($dtStart) && !empty($dtEnd)) {
            $where["patient.created_at >="] =  "$dtStart 00:00:00";
            $where["patient.created_at <="] =  "$dtEnd 23:59:59";
        }

        $resp = $this->modPatient
            ->select("
                patient.id,
                patient.created_at as date,
                patient.name as name,
            ")
            ->where($where)
            ->orderBy('patient.created_at', $order)
            ->findAll(30);

        //:Lista não existe
        if (empty($resp))
            $resp = [];

        return $resp;
    }
}
