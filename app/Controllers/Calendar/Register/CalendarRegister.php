<?php

namespace App\Controllers\Calendar\Register;

use App\Controllers\FetchController;
use App\Libraries\Date\BomDia;
use App\Libraries\ZapGti\SendText;
use App\Models\Os\OsRegister_Model;
use App\Models\Os\OsProcedure_Model;
use App\Models\Whatsapp\ZapBotFirstContact_Model;

class CalendarRegister extends FetchController
{
    private $modOs;

    public function __construct()
    {
        $this->modOs = new OsRegister_Model();
    }

    //:RETORNA REQUEST COM LISTA DE AGENDAMENTOS
    public function getData($resp = null)
    {
        parent::initFetch('127P', false);

        $returnData = [];

        $profId = $this->request->getVar('profId');
        $profName = $this->request->getVar('profName');
        $start =  $this->request->getVar('start');
        $end = $this->request->getVar('end');

        //:Retorna calendarList
        $returnData['calendarList'] = $this->getCalendarList($profId, $start, $end);

        //:Retorna prof
        $returnData['prof'] = $this->getProf($returnData['calendarList'], $profId, $profName);

        //:Retorna resp (vindo de outra função)
        if ($resp)
            $returnData['resp'] = $resp;

        dieJson(200, $returnData);
    }

    //:RETORNA LISTA COM AGENDAMENTOS
    private function getCalendarList($profId, $start, $end)
    {
        $clinicId = session('clinic')['id'];
        $start = date('Y/m/d H:i:s', strtotime($start));
        $end = date('Y/m/d H:i:s', strtotime($end));
        $where = "os.calendar_start >= '$start' AND os.calendar_end <= '$end' AND os.id_clinic = '$clinicId'";
        $where .= intval($profId) > 0 ? " AND os.id_prof = '$profId'" : '';

        return $this->modOs
            ->select("
                os.id,
                os.id_clinic,
                os.id_prof,
                os.id_patient       as patientId,
                os.id_procedureMain,
                os.id_status        as statusId,
                os.id_display,
                os.notes,
                os.message_count,
                os.return,
                os.calendar_start   as start,
                os.calendar_end     as end,
                os.vl_procedureTotal,
                os.updated_at       as optLock,
                patient.name_social as title,
                patient.name        as patientName,
                procedure.name      as procedureName,
                clinic.name_social  as clinicName,
                status.name         as statusName,
                CONCAT_WS(' ', prof.name_prefix, prof.name_social) as profName,
            ")
            ->where($where)
            ->join('patient', 'patient.id = os.id_patient', 'left')
            ->join('user prof', 'prof.id = os.id_prof', 'left')
            ->join('procedure', 'procedure.id = os.id_procedureMain', 'left')
            ->join('clinic', 'clinic.id = os.id_clinic', 'left')
            ->join('os__status status', 'status.id = os.id_status', 'left')
            ->orderBy('start')
            ->findAll();
    }

    //:RETORNA DADOS DO PROFISSIONAL
    private function getProf($returnData, $profId, $profName)
    {
        if ((int) $profId > 0) {
            //:Apenas o médico selecionado
            if (!empty($returnData['calendarList'][0]->id_prof)) {
                //:Se existir lista pega dados primeiro registro
                $profId = $returnData['calendarList'][0]->id_prof;
                $profName = $returnData['calendarList'][0]->profName;
            }
        } else {
            //:Todos os médicos
            $profId = 0;
            $profName = 'Todos';
        }

        return [
            'profId' => $profId,
            'profName' => $profName,
        ];
    }

    //:SALVA AGENDAMENTO
    public function setCalendar()
    {
        $optLock = parent::initFetch('140P', true);

        $dbInput = $this->request->getVar('data');

        $clinicId = session('clinic')['id'];
        $dbInput->id_clinic = $clinicId;
        $osId = $dbInput->id;
        $isNew = $osId === 'new' ? true : false;

        //:Se for alteração
        if (!$isNew) {
            $osData = $this->modOs->where('id', $osId)->first();

            //:Valida Optimistic Lock
            if ($osData->updated_at !== $optLock)
                dieJson(453);

            //:Valida se os existe
            if (!$osData)
                dieJson(456, 'Os não encontrada');

            //:Valida se está em andamento ou finalizado
            if ($osData->id_status == 50)
                dieJson(405, "TD:Erro ao salvar!|O prontuário já foi aberto.");

            //:Valida se está em andamento ou finalizado
            if ($osData->id_status > 50)
                dieJson(405, "TD:Erro ao salvar!|O serviço já foi finalizado.");

            //:Valida se pertence a clínica da sessão
            if ($osData->id_clinic != session('clinic')['id'])
                dieJson(455, 'Clinica inválida');

            //:Se houve alteração de data, altera status para agendado
            if (!empty($dbInput->dateChanged)) {
                $dbInput->id_status = 10;
            }

            unset($dbInput->id_prof);
            unset($dbInput->id_patient);
            unset($dbInput->id_procedureMain);
            unset($dbInput->dateChanged);
        } else {
            $dbInput->id_status = 10;
        }

        //:Pega valor do procedimento e remove do objeto
        $procedureValue = empty($dbInput->value) ? 0 : $dbInput->value;
        unset($dbInput->value);

        //:Salvar Os
        $newId = $this->modOs->saveWau($dbInput);

        //:Se for nova Os
        if ($isNew) {
            //:Insere procedimento na OS
            $modOsProcedure = new OsProcedure_Model();
            $modOsProcedure->protect(false)->insert([
                'id_os' => $newId,
                'id_procedure' => $dbInput->id_procedureMain,
                'qt' => 1,
                'vl_sale' => $procedureValue,
                'vl_total' => $procedureValue,
            ]);
        }

        $this->getData();
    }

    //:DELETA AGENDAMENTO
    public function delCalendar()
    {
        $optLock = parent::initFetch('135P', true);

        $osId = $this->request->getVar('osId');

        $osData = $this->modOs->where('id', $osId)->first();

        //:Valida Optimistic Lock
        if ($osData->updated_at !== $optLock)
            dieJson(453);

        //:Redireciona para OS
        return redirect()->to(base_url("osRegister/deleteOs/$osId/false"));
    }

    //:ENVIA CONFIRMAÇÃO DE AGENDAMENTO
    public function sendScheduleConfirmation()
    {
        $optLock = parent::initFetch('153P', true);

        $dbInput = $this->request->getVar('data');
        $osId = $dbInput->id;
        $senderNumber = '5511947614485';
        // $senderNumber = '5511945966958';

        //:Busca dados para envio de mensagem
        $osData = $this->modOs
            ->select("
                os.updated_at           as optLock,
                os.calendar_start       as calendarStart,
                os.message_count        as message_count,
                os.id_status            as idStatus,
                patient.id              as patientId,
                patient.name_social     as patientName,
                procedure.name          as procedureName,
                clinic.name_social      as clinicName,
                zbfc.number             as botNumber,
                
                CONCAT(patient.phone_ddi, patient.phone_number)     as patientPhone,
                CONCAT_WS(' ', prof.name_prefix, prof.name_social)  as profName,
            ")
            ->where('os.id', $osId)
            ->join('patient', 'patient.id = os.id_patient', 'left')
            ->join('user prof', 'prof.id = os.id_prof', 'left')
            ->join('procedure', 'procedure.id = os.id_procedureMain', 'left')
            ->join('clinic', 'clinic.id = os.id_clinic', 'left')
            ->join('zap_botfirstcontact zbfc', 'zbfc.id_table = patient.id AND zbfc.table = "PA"', 'left')
            ->first();

        //:Valida Optimistic Lock
        if ($osData->optLock !== $optLock)
            dieJson(453);

        //:Adiciona numero do bot na lista p/ identificar primeira mensagem
        if (!$osData->botNumber) {
            $zapBotFirstContact = new ZapBotFirstContact_Model();
            $zapBotFirstContact->protect(false)
                ->set('id_table', $osData->patientId)
                ->set('table', 'PA')
                ->set('number', $senderNumber)
                ->insert();
        }

        //:Se status for maior que 30 -> bloqueia envio de mensagem
        //:Não faz sentido enviar mensagem p/ pacientes que estão ou já estiveram na recepção
        if ($osData->idStatus > 30)
            $this->getData();

        //:Monta mensagem
        $bomDia = BomDia::render();
        $msg = "$bomDia, $osData->patientName!\n\n";
        $msg .= "Estamos entrando em contato para confirmar seu agendamento no ";
        $msg .= "dia $osData->calendarStart com o $osData->profName.\n\n";

        //:Envia mensagem por WhatsApp
        $zapResp = SendText::render($senderNumber, $osData->patientPhone, $msg);

        //:Se deu erro ao enviar mensagem -> retorna fetch
        if ($zapResp->error)
            $this->getData($zapResp);

        //:Adiciona 1 no contador de mensagens enviadas
        $this->modOs->protect(false)
            ->set('message_count', 'message_count + 1', false)
            ->update($osId);

        //:Limita status para 20 ou 30
        if ($osData->idStatus < 30) {
            $id_status = $osData->message_count == 0 ? 20 : 30;
            $this->modOs->protect(false)
                ->set('id_status', $id_status)
                ->update($osId);
        }

        $this->getData($zapResp);
    }
}
