<?php

namespace App\Controllers\Report\Bank\List;

use App\Controllers\FetchController;
use App\Models\Financial\Link\FinLink_Model;

class ReportBankList extends FetchController
{
    private $modFinLink;

    public function __construct()
    {
        $this->modFinLink = new FinLink_Model();
    }

    //:RETORNA FETCH COM LISTA DE BANCOS
    public function getData()
    {
        parent::initFetch('169P', false);

        $dtStart = $this->request->getVar('dtStart');
        $dtEnd = $this->request->getVar('dtEnd');
        $bankId = $this->request->getVar('bankId');
        $order = $this->request->getVar('order');
        $returnData = [];

        //:Retorna lista de serviços
        $returnData['bankList'] = $this->getBankList(
            $dtStart,
            $dtEnd,
            $bankId,
            $order,
        );

        dieJson(200, $returnData);
    }

    private function getBankList($dtStart, $dtEnd, $bankId, $order)
    {
        if (!$bankId)
            return [];

        //:Redefine valor para $order
        $order = strtoupper((string) $order);
        $order = \in_array($order, ['ASC', 'DESC'], true) ? $order : 'DESC';

        //:Inicia filtro
        $where = [];

        //:Filtra clínica
        $where["fc.id_clinic"] = session('clinic')['id'];

        //:Filtro período
        if (!empty($dtStart) && !empty($dtEnd)) {
            $where["fc.date >="] =  "$dtStart 00:00:00";
            $where["fc.date <="] =  "$dtEnd 23:59:59";
        }

        //:Filtra banco
        $where["fin__link.id_targetName"] = 15;
        $where['fin__link.id_targetId'] = $bankId;

        $resp = $this->modFinLink
            ->select("
                fin__link.id,
                fin__link.sign,
                fc.date,
                fc.text,
                fc.value,
            ")
            ->where($where)
            ->join('fin__content fc', 'fc.id = fin__link.id_content')
            ->orderBy('fc.date, fc.id', $order)
            ->findAll(15);

        //:Lista não existe
        if (empty($resp))
            dieJson(456, 'WAU-0180');

        return $resp;
    }
}
