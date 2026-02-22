<?php

namespace App\Controllers\Gpt;

use App\Controllers\BaseController;
use App\Models\User\User_register_Model;
use App\Models\Marketing\Lead\LeadRegister_Model;
use App\Models\Whatsapp\Contact\ZapContact_Model;
use App\Models\Gpt\Gpt_Model;
use App\Libraries\Gpt\GptLib;

class Gpt extends BaseController
{
    private $modUser;
    private $modLead;
    private $modZapContact;
    private $modGpt;
    private $libGpt;

    public function __construct()
    {
        $this->modUser = new User_register_Model();
        $this->modLead = new LeadRegister_Model();
        $this->modZapContact = new ZapContact_Model();
        $this->modGpt = new Gpt_Model();
        $this->libGpt = new GptLib();
    }

    /** //-INDEX */
    public function index()
    {
        // die($this->teste());

        $this->initBackend(169);
        session()->setFlashdata('sidebar', [
            'menuActive' => '',
            'viewTitle' => 'Atendimento IA',
            'contenList' => ['gpt/sidebar'],
        ]);

        $uri = uri_string();
        $data = $this->dataCreate(
            ['gpt/gpt'],
            ['gpt/gpt'],
            'gpt'
        );

        return viewShow('gpt/gpt', $data);
    }

    /** //.BUSCA DADOS DO CONTEUDO
     * @param mixed $thisRegisterId
     * @return array<array|object|null>|\CodeIgniter\HTTP\ResponseInterface
     */
    public function getRegister($thisRegisterId = null)
    {
        $registerId = $thisRegisterId ?? $this->initFetch(169, 'registerId');

        //:BUSCA
        $data['register'] = $this->modGpt
            ->select('id, name, content')
            ->find($registerId);

        //:RETORNA LOCAL OU JSON
        return $thisRegisterId ? $data : $this->json(200, $data);
    }

    /** //+SALVA DADOS DO CONTEUDO */
    public function setRegister()
    {
        $registerId = $this->initFetch(169, 'registerId');
        $data = (array) $this->request->getVar('data');

        //:SALVA
        $this->modGpt
            ->protect(false)
            ->update($registerId, $data);

        //:BUSCA
        $data = $this->getRegister($registerId);

        return $this->json(200, $data);
    }

    /** //+DUPLICA DADOS DO CONTEUDO */
    public function duplicateRegister()
    {
        $registerId = $this->initFetch(9, 'registerId');

        //:BUSCA
        $data = $this->getRegister($registerId)['register'];
        unset($data->id);

        //:SALVA
        $this->modGpt
            ->protect(false)
            ->insert($data);

        //:BUSCA
        $data = $this->getRegister($registerId);

        return $this->json(200, $data);
    }

    /** //+BUSCA LISTA CONTEUDO */
    public function findContent()
    {
        $this->initFetch(169);

        $name = $this->request->getVar('find');

        $data['list'] = $this->modGpt
            ->select("gpt.id, gpt.name as col1")
            ->like("gpt.name", $name, 'LEFT')
            ->orderBy('gpt.name')
            ->findAll(30);

        return $this->json(200, $data);
    }

    /** //+BUSCA RESPOSTA */
    public function getReply()
    {
        $this->initFetch(169);
        $userQuestion = $this->request->getVar('userQuestion');

        //:BUSCA ID DO LEAD DO USUARIO QUE ESTÁ TESTANDO
        $leadId = $this->getLeadId();

        //:BUSCA INTERESSE DO USUÁRIO QUE ESTÁ TESTANDO
        $userInterest = $this->modZapContact->find($leadId)->interest;

        //:BUSCA RESPOSTA EM IA
        $data = $this->libGpt->getReply($userQuestion, $userInterest);

        //:SALVA INTERESSE DO USUARIO QUE ESTÁ TESTANDO
        $this->modZapContact->protect(false)->update($leadId, ['interest' => $data['interest']]);

        return $this->json(200, $data);
    }

    /** //+DELETA INTERESSE DA SESSION */
    public function delInterest()
    {
        session()->set([
            'gpt' => [
                'question1' => '',
                'question2' => '',
            ]
        ]);

        //:ZERA INTERESSE DO USUARIO QUE ESTÁ TESTANDO
        $leadId = $this->getLeadId();
        $this->modZapContact->protect(false)->update($leadId, ['interest' => '']);

        $data['gpt'] = session()->gpt;
        $data['gpt']['interest'] = '';

        return $this->json(200, $data);
    }

    /** //-BUSCA ID DO LEAD DO USUARIO QUE ESTÁ TESTANDO */
    private function getLeadId()
    {
        $userId = session()->log_userId;//:PEGA ID DO USUARIO LOGADO
        $cel = $this->modUser->find($userId)->cell;//:BUSCA CEL DO USUARIO
        $cel = '55' . removeSpecialChars($cel, 'espaco');//:TRATA NUMERO DE CELULAR
        $leadId = $this->modLead->where('phone', $cel)->first()->id;//:BUSCA ID DO LEAD DO USUARIO

        return $leadId;
    }

    public function teste()
    {
        $expedienteInicio = "9:00";
        $expedienteFim = "18:00";

        $fdsInicio = [
            'dia' => 'sabado',
            'hora' => '12:30',
        ];

        $fdsFim = [
            'dia' => 'segunda',
            'hora' => '09:00',
        ];

        //:Mapeia nomes dos dias para número (0=domingo, 1=segunda, ..., 6=sábado)
        $mapaDias = [
            'domingo' => 0,
            'segunda' => 1,
            'terça' => 2,
            'terca' => 2,
            'quarta' => 3,
            'quinta' => 4,
            'sexta' => 5,
            'sábado' => 6,
            'sabado' => 6,
        ];

        //:Converte o início e fim para timestamps com base na semana atual
        $semana = new \DateTimeImmutable('last sunday'); // base: início da semana
        $inicioTimestamp = (new \DateTime($semana->modify("+{$mapaDias[$fdsInicio['dia']]} days")->format('Y-m-d') . ' ' . $fdsInicio['hora']))->getTimestamp();
        $fimTimestamp = (new \DateTime($semana->modify("+{$mapaDias[$fdsFim['dia']]} days")->format('Y-m-d') . ' ' . $fdsFim['hora']))->getTimestamp();

        //:Timestamp atual
        $agoraTimestamp = time();

        //:Debugar modificando o final de semana
        // $data = new \DateTime('last saturday 12:29', new \DateTimeZone('America/Sao_Paulo'));
        // $agoraTimestamp = $data->getTimestamp();

        //:Se o intervalo cruza o final de semana (ex: sexta -> segunda)
        if ($fimTimestamp < $inicioTimestamp) {
            //:Neste caso, está entre se for após o início OU antes do fim
            $fimDeSemana = ($agoraTimestamp >= $inicioTimestamp) || ($agoraTimestamp <= $fimTimestamp);
        } else {
            //:Intervalo comum
            $fimDeSemana = ($agoraTimestamp >= $inicioTimestamp) && ($agoraTimestamp <= $fimTimestamp);
        }

        //:Horario de expediente
        $agora = new \DateTime();
        $horaInicio = new \DateTime($expedienteInicio);
        $horaFim = new \DateTime($expedienteFim);
        $foraDeExpediente = !($agora >= $horaInicio && $agora < $horaFim);

        //:Fechado ou aberto true|false
        $fechado = $fimDeSemana || $foraDeExpediente;

        dj([
            'fimDeSemana' => $fimDeSemana,
            'foraDeExpediente' => $foraDeExpediente,
            'fechado' => $fechado ? 'SIM' : 'NÃO',
        ]);
    }
}