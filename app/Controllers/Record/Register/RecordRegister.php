<?php

namespace App\Controllers\Record\Register;

use App\Controllers\FetchController;
use App\Controllers\Record\Libraries\RecordCheckPending;
use App\Libraries\Date\DatePeriodResult;
use App\Models\Record\Register\RecordRegister_Model;
use App\Models\Os\OsRegister_Model;
use App\Models\Patient\Register\PatientRegister_Model;
use App\Models\Record\Module\RecordModule_Model;
use App\Models\User\User_record_Model;
use App\Models\Record\Allergy\RecordAllergy_Model;


class RecordRegister extends FetchController
{
    public $libDatePeriod;
    private $modRecord;
    private $modPatient;
    private $modRecordModule;

    public function __construct()
    {
        $this->libDatePeriod = new DatePeriodResult();
        $this->modRecord = new RecordRegister_Model();
        $this->modRecordModule = new RecordModule_Model();
        $this->modPatient = new PatientRegister_Model();
    }

    //:RETORNA FETCH COM TODOS OS DADOS DO PRONTUÁRIO
    public function getData()
    {
        parent::initFetch('143P', false);

        $recordId = (int) $this->request->getVar('recordId');

        //:Id inválido -> retorna 455 (id inválido)
        if ($recordId < 1)
            dieJson(455, 'WAU-0072');

        //:Busca dados do prontuário
        $recordData = $this->getRecord($recordId);

        //:Prontuário não pertence ao profissional logado
        if ($recordData->id_prof != session()->log_userId)
            dieJson(468, 'WAU-0074');

        //:Retorna dados do prontuário
        $returnData['record'] = $recordData;

        //:Retorna tipos de módulos do usuário
        $returnData['modulesType'] = $this->getModulesType($recordData->modulesOrder);

        //:Retorna módulos do prontuário
        $returnData['modules'] = $this->getModules($recordId);

        //:Retorna dados do paciente
        $returnData['patient'] = $this->getPatient($recordData->id_patient);

        dieJson(200, $returnData);
    }

    //:RETORNA DADOS DO PRONTUÁRIO
    private function getRecord($recordId)
    {
        $resp = $this->modRecord
            ->select("
                id,
                id_patient,
                id_clinic,
                id_prof,
                id_procedure,
                id_os,
                id_pending,
                signature_status,
                modulesOrder,
                hiddenModules
            ")
            ->find($recordId);

        //:Prontuário não existe
        if (empty($resp))
            dieJson(468, 'WAU-0073');

        return $resp;
    }

    //:RETORNA DADOS DOS MÓDULOS
    private function getModules($recordId)
    {
        return $this->modRecordModule
            ->select("
                record__module.id,
                record__module.id_record,
                record__module.id_file_type,
                COALESCE(NULLIF(record__module.title, ''), ur.title) as title,
                COALESCE(NULLIF(record__module.content, ''), ur.content) as content,
                ur.type,
                ur.required
            ")
            ->join('user__record ur', 'ur.id = record__module.id_file_type', 'left')
            ->where('id_record', $recordId)
            ->findAll();
    }

    //:RETORNA DADOS DOS TIPOS DE MÓDULOS DO USUÁRIO
    private function getModulesType($modulesOrder = null)
    {
        $modUserRecord = new User_record_Model();
        $loginId = session()->log_userId;

        $ids = [];
        if (!empty($modulesOrder)) {
            $ids = array_filter(array_map('trim', explode(';', $modulesOrder)));
        }

        if (empty($ids)) {
            return [];
        }

        return $modUserRecord
            ->select('id, type, title, content')
            // ->where('id_user', $loginId)
            ->whereIn('id', $ids)
            // ->orWhere('untrash', 1)
            ->findAll();
    }

    //:RETORNA FETCH COM DADOS DO PACIENTE
    private function getPatient($patientId)
    {
        if (empty($patientId))
            return null;

        $resp = $this->modPatient
            ->select("
                patient.id,
                patient.name,
                patient.cpf,
                patient.phone_number,
                patient.birthday,
                1           as checkIdOs,
                1           as checkIdRecord,
            ")
            ->find($patientId);

        $resp->age = $this->libDatePeriod->render($resp->birthday);

        return $resp;
    }

    //:RETORNA FETCH COM LISTA DE ALERGIAS
    public function getAllergy()
    {
        //:Busca variável 'find' da requisição
        $find = $this->request->getVar('find');

        $modRecordAllergy = new RecordAllergy_Model();

        $returnData['list'] = $modRecordAllergy
            ->select('name')
            ->like('name', $find, 'both')
            ->orderBy('name')
            ->findAll(10);

        dieJson(200, $returnData);
    }

    //:SALVA DADOS VINDOS DE FETCH
    public function setData()
    {
        $recordId = $this->request->getVar('recordId');
        $dbInput = $this->request->getVar('data');

        //:Id inválido -> retorna 455 (id inválido)
        if ($recordId < 1)
            dieJson(455);

        //:Acesso invalido -> retorna 468 (sem permissão)
        if (!parent::initFetch('143P', true))
            dieJson(468);

        //:Salva dados do prontuário
        if (!empty($dbInput->record->save)) {
            unset($dbInput->record->save);
            $this->setRecord($recordId, $dbInput->record);
        }

        //:Salva dados dos módulos
        if (!empty($dbInput->modules)) {
            foreach ($dbInput->modules as $module) {
                $this->setModule($module->id, $module);
            }
        }

        $this->getData();
    }

    //:SALVA PRONTUÁRIO
    private function setRecord($recordId, $dbInput)
    {
        //:Atualiza prontuário existente
        $this->modRecord->protect(false)->update($recordId, $dbInput);
    }

    //:SALVA MÓDULO
    private function setModule($moduleId, $dbInput)
    {
        //:Se id contém "new" -> cria novo módulo
        if (isset($dbInput->id) && strpos($dbInput->id, 'new') !== false) {
            unset($dbInput->id); //:Remove o id para evitar conflitos
            $this->modRecordModule->protect(false)->insert((array)$dbInput);
            return;
        }

        //:Atualiza prontuário existente
        $this->modRecordModule->protect(false)->update($moduleId, $dbInput);
    }

    //:SALVA MÓDULO
    public function setPdf()
    {
        $recordId = $this->request->getVar('recordId');
        $content = $this->request->getVar('pdfContent');

        //:Busca módulo do PDF
        $moduleData = $this->modRecordModule
            ->select("id")
            ->where('id_record', $recordId)
            ->where('id_file_type', 20)
            ->first();

        //:Define id do módulo caso exista -> não existe irá criar (0 = novo módulo)
        $id = (!empty($moduleData->id)) ? $moduleData->id : '';

        //:Prepara dados para salvar
        $dbInput = [
            'id' => $id,
            'id_record' => $recordId,
            'id_file_type' => 20,
            'content' => $content,
        ];

        //:Salva módulo do PDF
        $this->modRecordModule->protect(false)->save($dbInput);

        dieJson(200);
    }

    //:FINALIZA PRONTUÁRIO
    public function finalizeRecord()
    {
        $recordId = $this->request->getVar('recordId');

        //:Id inválido -> retorna 455 (id inválido)
        if (\intval($recordId)  < 1)
            dieJson(455);

        //:Acesso invalido -> retorna 468 (sem permissão)
        if (!parent::initFetch('143P', true))
            dieJson(468);

        //:Busca dados do prontuário
        $recordData = $this->modRecord->select('id_os, id_prof')->find($recordId);

        //:Prontuário não existe
        if (empty($recordData))
            dieJson(456);

        //:Prontuário não pertence ao profissional logado
        if ($recordData->id_prof != session()->log_userId)
            dieJson(468);

        helper('cookie');

        //:Atualiza prontuário para finalizado
        $data = ['id_pending' => NULL, 'status' => 2];
        $this->setRecord($recordId, $data);

        //:Deleta todos os módulos do prontuário, exceto o PDF
        $this->modRecordModule
            ->where('id_record', $recordId)
            ->where('id_file_type !=', 20)
            ->delete();

        //:Deleta cookie de prontuário pendente
        delCook('pendingRecord');

        dieJson(200);
    }

    //:CRIA NOVO PRONTUÁRIO
    public function newRecord()
    {
        //:Acesso invalido -> retorna 468 (sem permissão)
        if (!parent::initFetch('78P', false))
            dieJson(468);

        $osId = $this->request->getVar('osId');
        $loginId = session()->log_userId;

        $modOs = new OsRegister_Model();
        $libRecordCheckPending = new RecordCheckPending();

        //:Existe prontuário pendente -> retorna fetch com erro
        $pending = $libRecordCheckPending->checkPendingRecord($this->modRecord);
        if ($pending) {
            $returnData = ['pendingRecord' => $pending];
            dieJson(400, $returnData);
        }

        //:Busca Os
        $os = $modOs
            ->select("
                os.id,
                os.id_patient,
                os.id_prof,
                os.id_procedureMain,
                os.id_clinic,
                user.modulesOrder as userModulesOrder,
            ")
            ->where('os.id', $osId)
            ->join('user', 'user.id = os.id_prof', 'left')
            ->first();
        ///
        if (empty($os))
            dieJson(400, 'Serviço não encontrado.');
        ///
        if ($os->id_prof != $loginId)
            dieJson(400, 'Serviço pertence a outro profissional.');

        //:Define módulos padrão caso usuário não tenha módulos personalizados
        $os->userModulesOrder = $os->userModulesOrder ?: '15;1;13;2';

        //:Cria novo prontuário p/ OS
        $this->modRecord->protect(false)->insert([
            'id_patient' => $os->id_patient,
            'id_clinic' => $os->id_clinic,
            'id_prof' => $os->id_prof,
            'id_procedure' => $os->id_procedureMain,
            'id_os' => $os->id,
            'id_login' => $loginId,
            'id_pending' => $loginId,
            'modulesOrder' => $os->userModulesOrder,
            // 'status' => 1,
        ]);

        //:Atualiza status da OS para 'Em Atendimento' (5)
        $modOs->protect(false)->update($osId, ['id_status' => 50]);

        //:Retorna verificação de prontuário pendente
        $this->checkPendingRecord();
    }

    //:DELETA PRONTUÁRIO
    public function deleteRecord()
    {
        $recordId = $this->request->getVar('recordId');

        //:Id inválido -> retorna 455 (id inválido)
        if ((int) $recordId  < 1)
            dieJson(455);

        //:Acesso invalido -> retorna 468 (sem permissão)
        if (!parent::initFetch('143P', false))
            dieJson(468);

        //:Busca dados do prontuário
        $recordData = $this->modRecord->select('id_os, id_prof')->find($recordId);

        //:Prontuário não existe
        if (empty($recordData))
            dieJson(456);

        //:Prontuário não pertence ao profissional logado
        if ($recordData->id_prof != session()->log_userId)
            dieJson(468);

        //:Carrega helper de cookie
        helper('cookie');

        //* * * * * * * * * * * * * * * * * * * *
        //* DELETANTO MODULOS E PRONTUÁRIO
        //* * * * * * * * * * * * * * * * * * * *
        //:Deleta todos os módulos do prontuário
        $this->modRecordModule->where('id_record', $recordId)->delete();

        //:Verifica se ainda existe algum módulo vinculado ao prontuário (deu erro ao deletar)
        $hasAnyModule = $this->modRecordModule->where('id_record', $recordId)->first();
        if ($hasAnyModule)
            dieJson(400, 'TD:Houve um erro ao deletar os módulos do prontuário.');

        //:Deleta prontuário
        $resp = $this->modRecord->protect(false)->delete($recordId);

        //:Deleta cookie de prontuário pendente
        if ($resp)
            delCook('pendingRecord');
        //* * * * * * * * * * * * * * * * * * * *

        //:Atualiza status da OS para 'Aguardando' (40)
        $modOs = new OsRegister_Model();
        $modOs->protect(false)->update($recordData->id_os, ['id_status' => 40]);

        dieJson(200);
    }

    //:VERIFICA SE EXISTE PRONTUÁRIO PENDENTE
    public function checkPendingRecord()
    {
        $libRecordCheckPending = new RecordCheckPending();

        $returnData['pendingRecord'] = $libRecordCheckPending->checkPendingRecord($this->modRecord);

        dieJson(200, $returnData);
    }
}
