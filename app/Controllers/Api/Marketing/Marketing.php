<?php

namespace App\Controllers\Api\Marketing;

use App\Controllers\RestController;
use App\Libraries\Whatsapp\ZapSendText;
use App\Libraries\Whatsapp\ZapSendLink;
use App\Libraries\Marketing\MarketingLib;
use App\Models\Marketing\Lead\Marketing_lead_Model;
use App\Models\Procedure\Procedure_Model;

//LIBERA ACESSOS VINDOS DE URLS EXTERNAS
// header('Access-Control-Allow-Origin: *');
// header("Access-Control-Allow-Headers: Content-Type");

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');

class Marketing extends RestController
{
    private $zapText;
    private $zapLink;
    private $modLead;
    private $modProcedure;
    private $lib;

    public function __construct()
    {
        $this->zapText = new ZapSendText();
        $this->zapLink = new ZapSendLink();
        $this->modLead = new Marketing_lead_Model();
        $this->modProcedure = new Procedure_Model();
        $this->lib = new MarketingLib();
    }

    public function setTable()
    {
        $this->checkToken();
        helper('global');

        //-GET
        $leadId = $this->request->getVar('leadId');
        $screenSize = $this->request->getVar('screenSize');
        $os = $this->request->getVar('os');
        $staff = $this->request->getVar('staff');
        $ads = intval(base64url_decode($this->request->getVar('ads')));
        $ip = $this->request->getVar('ip');
        $newSection = $this->request->getVar('newSection');
        $zapSource = $this->request->getVar('source');
        $videoSource = $this->request->getVar('videoSource');
        $cadName = $this->request->getVar('cadName');
        $cadCel = $this->request->getVar('cadCel');
        $cadEmail = $this->request->getVar('cadEmail');
        $seconds = $this->request->getVar('seconds');

        // $phone = $this->request->getVar('phone');
        $iaUnlock = $this->request->getVar('iaUnlock');
        if ($iaUnlock) {
            $this->zapIaUnlock($cadCel);
        }

        // $this->zapIaUnlock('5511989497692', $cadCel);
        // arquiva('testefasdfsfsdfsafsadfsafasdfsdfsads', 'zzz');

        //-TRATA IP
        if (!$this->request->isValidIP($ip) || $ip == '::1') {
            $ip = $ip == '::1' ? $ip : 0;
            $ipCity = '';
            $ipState = '';
            $ipCountry = '';
        } else {
            $url = "http://ip-api.com/json/$ip";
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            $result = json_decode(curl_exec($ch));

            $ipCity = $result->city;
            $ipState = $result->region;
            $ipCountry = $result->countryCode;
        }

        //-CHECA TABELA
        $leadTable = $this->modLead->find($leadId);

        //-CRIA ARRAY P/ TABELA
        $dataTable = [];
        //
        $dataTable['id'] = $leadTable ? $leadId : 0;
        //
        if ($screenSize) {
            $dataTable['screen'] = $screenSize;
        }
        if ($os) {
            $dataTable['os'] = $os;
        }
        if ($staff) {
            $dataTable['staff'] = $staff;
        }
        if ($ads) {
            $dataTable['ads'] = $ads;
        }
        if ($ip) {
            $dataTable['ip'] = $ip;
        }
        if ($ipCity) {
            $dataTable['city'] = $ipCity;
        }
        if ($ipState) {
            $dataTable['state'] = $ipState;
        }
        if ($ipCountry) {
            $dataTable['country'] = $ipCountry;
        }
        if ($newSection) {
            $countSection = ($leadTable ? $leadTable->section_count : 0) + 1;
            $dataTable['section_count'] = $countSection;
        }
        if ($zapSource) {
            $dataTable['zap_count'] = $leadTable->zap_count + 1;
        }
        if ($zapSource == 'footer') {
            $dataTable['zap_footer'] = $leadTable->zap_footer + 1;
        }
        if ($zapSource == 'absolute') {
            $dataTable['zap_absolute'] = $leadTable->zap_absolute + 1;
        }
        if ($zapSource == 'schedule') {
            $dataTable['zap_schedule'] = $leadTable->zap_schedule + 1;
        }
        if ($zapSource == 'talk') {
            $dataTable['zap_talk'] = $leadTable->zap_talk + 1;
        }
        if ($zapSource == 'topmenu') {
            $dataTable['zap_topmenu'] = $leadTable->zap_topmenu + 1;
        }
        if ($videoSource) {
            $dataTable['video_count'] = $leadTable->video_count + 1;
        }
        if ($cadName) {
            $dataTable['name'] = $cadName;
        }
        if ($cadCel) {
            $dataTable['cell'] = $cadCel;
        }
        if ($cadEmail) {
            $dataTable['email'] = $cadEmail;
        }
        if ($seconds) {
            //:PEGA A HORA NO BD E ADICIONA OS SEGUNDOS
            $hora = $leadTable->timer ?? "00:00:00";
            $horaNova = date("H:i:s", strtotime("$hora +$seconds seconds"));
            $dataTable['timer'] = $horaNova;
        }

        //-SALVA
        $result = $this->modLead->saveWau($dataTable);

        //-ZAP DE CONFIRMAÇÃO DE ENVIO DE CADASTRO
        if ($cadCel)
            $this->zapRegisterReceived($dataTable);

        //-RETORNA
        $data = ['status' => 200, 'leadId' => $result];
        return $this->response->setJSON($data);
    }

    /** //*ZAP DE CONFIRMAÇÃO DE ENVIO DE CADASTRO */
    public function zapRegisterReceived($dataTable = null)
    {
        //-BOM DIA
        helper('bomDia');
        $bomdia = bomDia();

        //-GLOBAL
        $txt = "*$bomdia!*\n\n";

        $txt .= "Recebemos seus dados através de nosso simulador de Mamoplastia de Aumento.\n\n";

        $txt .= "Nome: {$dataTable['name']}\n";
        $txt .= "Telefone: {$dataTable['cell']}\n";
        $txt .= isset($dataTable['email']) ? "Email: {$dataTable['email']}\n\n" : "\n";

        $txt .= "Recebemos esse cadastro em seu nome. Por favor, confirme com um \"OK\" se você realmente se cadastrou ou nos envie uma mensagem para cancelar esse cadastro. Agradecemos sua compreensão.\n";

        //-GLOBAL
        $this->zapLink->sendLink([
            'instance' => "recepcao",
            'phone' => "55{$dataTable['cell']}",
            'message' => $txt,
            'image' => "https://arcapp.com.br/img/logos/arc/arc_zap_01.jpg",
            'linkDescription' => "Centro Cirúrgico & Hospital Dia",
        ]);
    }

    /** //*ZAP DE CONFIRMAÇÃO DE ENVIO DE CADASTRO */
    public function zapIaUnlock($cadCel)//
    {
        $txt = "FERRAMENTA EM TESTE\n\n";
        $txt .= "IA desbloqueada.\n\n";
        $txt .= "Agora vc pode fazer pergunstas como:\n";
        $txt .= "- Quanto custa uma cirurgia de (prótese mamaria, lipo, mastopexia, etc).\n";
        $txt .= "- Qual o preço da consulta.\n";
        $txt .= "- Qual é o endereço.\n\n";
        $txt .= "Para parar as respostas automáticas basta digitar \"parar ia\"\n";

        $this->zapText->sendText(
            "recepcao",
            "{$cadCel}",
            $txt,
        );
    }

    public function encodeCreate()
    {
        $result1 = $this->lib->encode('52');
        $result2 = $this->lib->encode('53');
        $result3 = $this->lib->encode('54');

        $result4 = $this->lib->decode($result1);
        $result5 = $this->lib->decode($result2);
        $result6 = $this->lib->decode($result3);

        die(json_encode($result1 . ' - ' . $result2 . ' - ' . $result3 . '  ' . $result4 . ' - ' . $result5 . ' - ' . $result6));
    }
}
