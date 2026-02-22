<?php

namespace App\Controllers\Api\Whatsapp;

//*HEADER
$http_origin = $_SERVER['HTTP_ORIGIN'];
//
if ($http_origin == "https://api.z-api.io" || $http_origin == "https://arcapp.com.br" || $http_origin == "http://localhost") {
    header("Access-Control-Allow-Origin: $http_origin");
} else {
    // arquiva('ORIGIN BLOQUEADA: ' . $http_origin, 'arq_origin_erro');
    dieJson(200, 'erro de origem');
}
//
header("Access-Control-Allow-Headers: Content-Type");

use CodeIgniter\Controller;
use App\Libraries\Whatsapp\ZapSendText;
use App\Libraries\Whatsapp\ZapSendLink;
use App\Libraries\Whatsapp\ZapSendButton;
use App\Libraries\Tools\Audit;
use App\Libraries\Gpt\GptLib;
use App\Models\Marketing\Lead\LeadRegister_Model;
use App\Models\Whatsapp\Contact\ZapContact_Model;
use App\Models\Whatsapp\Message\ZapMessage_Model;
use App\Models\Config\Config_Model;

class Webhook extends Controller
{
    private $zapText;
    private $zapLink;
    private $zapButton;
    private $modLead;
    private $modZapContact;
    private $modZapMessage;
    private $modConfig;
    private $isOpen;
    private $btnIaStatus;
    private $gpt;

    public function __construct()
    {
        date_default_timezone_set('America/Sao_Paulo');

        $this->zapText = new ZapSendText();
        $this->zapLink = new ZapSendLink();
        $this->zapButton = new ZapSendButton();
        $this->modLead = new LeadRegister_Model();
        $this->modZapContact = new ZapContact_Model();
        $this->modZapMessage = new ZapMessage_Model();
        $this->modConfig = new Config_Model();
        $this->isOpen = false;

        //:ESTENDE OU NÃO LIBRARY DO CHATGPT
        $this->btnIaStatus = $this->modConfig->find('btnIaStatus')->value;
        if ($this->btnIaStatus == 1)
            $this->gpt = new GptLib();
    }

    /** //-WEBHOOK DE RECEBIMENTO DE MENSAGENS */
    public function upNewMessage()
    {
        //:DATA
        $data = $this->request->getVar();

        $saveLeadContact = '';
        $saveZapContact = '';
        $saveZapMessage = '';
        $leadContactLinksSent = null;

        //:ESTAMOS ATENDENDO AGORA?
        $this->isOpen = ((date('D') == "Sat" || date('D') == "Sun") || (date('H:i') < "09:00" || date('H:i') > "18:00")) ? false : true;

        //:SE NÃO EXISTIR "connectedPhone"
        if (!isset($data->connectedPhone)) {
            arquiva($data, "Webhook_connectedPhone");

            //:RETORNA JSON
            dieJson(200);
        }

        //:BUSCA CONTATO NA TABELA LEAD
        $leadContact = $this->modLead->select('id')->where('phone', $data->phone)->first();
        $leadContactId = isset($leadContact->id) ? $leadContact->id : false;

        //:NOVO NUMERO DE ORDEM NA FILA
        $newOrd = $this->modZapContact->getLastOrd() + 1;

        //:STATUS: 1-LIDO, 2-NÃO LIDO
        $status = $data->fromMe ? 1 : 2;
        $status = isset($data->text->url) ? 2 : $status;

        //:TIPO DA MENSAGEM (RECEBENDO/ENVIANDO)
        $tpDateMessage = $data->fromMe ? 'dtLastSend' : 'dtLastReceave';

        //*INICIA SALVAR CONTATO
        if ($leadContactId) {//.CONTATO EXISTE
            //:ATUALIZA CONTATO NA TABELA WHATSAPP
            $saveZapContact = $this->modZapContact->protect(false)->update($leadContactId, [
                'ord' => $newOrd,
                'status' => $status,
                $tpDateMessage => date('Y-m-d H:i:s'),//:SALVA 'dtLastSend' OU 'dtLastReceave'
            ]);

        } else {//.CONTATO NOVO

            //:SALVA CONTATO NA TABELA LEAD
            $saveLeadContact = $this->modLead->protect(false)->save([
                'id_marketingSource' => 2,//:INSTAGRAM
                'name' => $data->chatName,
                'phone' => $data->phone,
                'linksSent' => strArray('1'),
                'status' => 1,//:ATIVO
                'created_at' => date('Y-m-d H:i:s')
            ]);

            //:SALVA CONTATO NA TABELA WHATSAPP
            $saveZapContact = $this->modZapContact->protect(false)->insert([
                'id' => $this->modLead->getInsertID(),//:MANTEM MESMO ID DO LEAD
                'ord' => $newOrd,
                'status' => $status,
                $tpDateMessage => date('Y-m-d H:i:s'),//:SALVA 'dtLastSend' OU 'dtLastReceave'
            ]);

            $leadContactLinksSent = true;
        }

        //:SE FOR EMOJI ADICIONA NA MENSAGEM EXISTENTE
        if (isset($data->reaction)) {
            //:UPDATE
            $this->modZapMessage
                ->protect(false)
                ->where('messageId', $data->reaction->referencedMessage->messageId)
                ->set(['reaction_value' => json_encode($data->reaction->value)])
                ->update();

            //:RETORNA JSON
            dieJson(200);
        }

        //*INICIA SALVAR MENSAGEM
        //:RETORNO GLOBAL
        $dataMsg = [
            'messageId' => $data->messageId ?? '',
            'fromMe' => $data->fromMe ? 1 : 2,
            'connectedPhone' => $data->connectedPhone ?? '',
            'phone' => $data->phone ?? '',
            'chatName' => $data->chatName ?? '',
            'senderName' => $data->senderName ?? '',
            'statusZap' => $data->status ?? '',
            'datetime' => date('Y-m-d H:i:s')
        ];
        //:RETORNO TEXTO/LINK
        if (isset($data->text)) {
            $dataMsg = array_merge($dataMsg, [
                'text' => $data->text->message ?? '',
                'text_description' => isset($data->text->description) ? $data->text->description : '',
                'text_title' => isset($data->text->title) ? $data->text->title : '',
                'text_url' => isset($data->text->url) ? $data->text->url : '',
                'text_thumbnailUrl' => isset($data->text->thumbnailUrl) ? $data->text->thumbnailUrl : '',
            ]);
        }
        //:RETORNO IMAGEM
        if (isset($data->image)) {
            $dataMsg = array_merge($dataMsg, [
                'image_url' => $data->image->imageUrl ?? '',
            ]);
        }
        //:RETORNO DE ANUNCIO
        if (isset($data->externalAdReply)) {
            $dataMsg = array_merge($dataMsg, [
                'external_title' => $data->externalAdReply->title ?? '',
                'external_url' => $data->externalAdReply->thumbnailUrl ?? '',
                'external_sourceUrl' => $data->externalAdReply->sourceUrl ?? '',
            ]);
        }
        //:RETORNO DE STICKER
        if (isset($data->sticker)) {
            $dataMsg = array_merge($dataMsg, [
                'sticker_url' => $data->sticker->stickerUrl ?? '',
            ]);
        }
        //:RETORNO DE ÁUDIO
        if (isset($data->audio)) {
            $dataMsg = array_merge($dataMsg, [
                'audio_url' => $data->audio->audioUrl ?? '',
                'audio_mimeType' => $data->audio->mimeType ?? '',
            ]);
        }
        //:SALVA
        $saveZapMessage = $this->modZapMessage->protect(false)->save($dataMsg);

        //:!INICIA ENVIO DE MENSAGENS AUTOMÁTICAS
        if (!$data->fromMe) {
            $resp = $this->gpt->start($data->text->message, $data->phone);

            if ($resp)
                $this->aiMessage($resp, $data->phone);
        }

        //:RETORNO DAS TABELAS
        $result = [
            'saveLeadContact' => $saveLeadContact,
            'saveZapContact' => $saveZapContact,
            'saveZapMessage' => $saveZapMessage
        ];

        //*DEBUG - SALVA EM ARQUIVOS
        //:DEBUG SALVA MENSAGEM
        // if ($data->phone == '5511989497692')
        // arquiva($data, "Webhook_Carlos");

        if (!$data->fromMe)
            arquiva($data, "Webhook");


        dieJson(200, $result);
    }

    /** //-STATUS DA MENSAGEM */
    public function messageStatus()
    {
        $data = $this->request->getVar();

        foreach ($data->ids as $key => $id) {
            $this->modZapMessage
                ->protect(false)
                ->where('messageId', $id)
                ->set(['statusZap' => $data->status])
                ->update();
        }

        dieJson(200, 'ok');
    }

    /** //-RESPOSTAS AUTOMATICAS ENVIADAS ATRAVES DE IA
     * @param string $ask pergunta
     * @param string $phone telefone de resposta
     * @return bool
     */
    public function aiMessage($resp, $phone)
    {
        return $this->zapText->sendText(
            "recepcao",
            $phone,
            $resp,
        );
    }

    /** //-ZAP PARA QUEM MORA EM USA
     * @param mixed $phone
     * @return bool
     */
    public function ZapUSA($phone = null)
    {
        //-TELEFONE
        $phone ??= $this->request->getVar()->phone;

        //-BOM DIA
        helper('bomDia');
        $bomdia = bomDia();

        //=INICIA MENSAGEM
        //-GLOBAL
        $txt = "*{$bomdia}!*\n\n";

        $txt .= "- Fazemos toda logística de hospedagem, translado e pós operatório para uma recuperação rápida.\n";
        $txt .= "- Parcelamos em até 22 vezes.\n";
        $txt .= "- Temos também a opção de pagamento através de *boleto bancário*.\n";
        $txt .= "- As avaliações são feitas no Centro Cirúrgico do *Instituto.arc* localizado na Rua Estados Unidos, 56 - no Jardins\n\n";

        if (!$this->isOpen) {//-ESTAMOS RESPONDENDO
            $txt .= "Nosso horário de atendimento é de segunda a sexta das 9h00 às 18h00.\n";
            $txt .= "Diga quais são suas dúvidas que responderemos assim que estivermos on-line.\n\n";
        }

        $txt .= "Enquanto aguarda atendimento, aproveite para ver nossas cirurgias clicando no link abaixo.\n";

        //-GLOBAL
        $this->zapLink->sendLink([
            'instance' => "recepcao",
            'phone' => $phone,
            'message' => $txt,
            'image' => "https://arcapp.com.br/img/zap/zap01_01.jpg",
            'linkUrl' => "https://institutoarc.com.br/usa?ads=Ng",
            'linkDescription' => "Núcleo de Cirurgia Plástica",
        ]);

        return true;
    }

    /** //-ZAP PARA QUEM MORA EM SP
     * @param mixed $phone
     * @return bool
     */
    public function ZapSP($phone = null)
    {
        //-TELEFONE
        $phone ??= $this->request->getVar()->phone;

        //-BOM DIA
        helper('bomDia');
        $bomdia = bomDia();

        //=INICIA MENSAGEM
        //-GLOBAL
        $txt = "*{$bomdia}!*\n\n";

        $txt .= "- Para cirurgias temos a opção de parcelamento em até 21x no cartão.\n";
        $txt .= "- Temos também a opção de pagamento através de *boleto bancário*.\n";
        $txt .= "- Nossas avaliações são feitas no espaço do *Instituto.arc*, localizado na Rua Estados Unidos, 56 - Jardins - São Paulo\n\n";

        if (!$this->isOpen) {//-ESTAMOS RESPONDENDO
            $txt .= "Nosso horário de atendimento é de segunda a sexta das 9h00 às 18h00.\n";
            $txt .= "Diga quais são suas dúvidas que responderemos assim que estivermos on-line.\n\n";
        }

        $txt .= "Enquanto aguarda seu atendimento, aproveite para conferir os impressionantes resultados das nossas cirurgias no antes e depois – basta clicar no link abaixo!\n";

        //-GLOBAL
        $this->zapLink->sendLink([
            'instance' => "recepcao",
            'phone' => $phone,
            'message' => $txt,
            'image' => "https://arcapp.com.br/img/zap/zap01_02.jpg",
            'linkUrl' => "https://institutoarc.com.br/plastica?ads=Ng",
            'linkDescription' => "Núcleo de Cirurgia Plástica",
        ]);

        return true;
    }

    /** //-ZAP PARA QUEM MORA FORA DE SP
     * @param mixed $phone
     * @return bool
     */
    public function ZapOutSP($phone = null)
    {
        //-TELEFONE
        $phone ??= $this->request->getVar()->phone;

        //-BOM DIA
        helper('bomDia');
        $bomdia = bomDia();

        //=INICIA MENSAGEM
        //-GLOBAL
        $txt = "*{$bomdia}!*\n\n";

        $txt .= "- Fazemos toda logística de hospedagem, translado e pós operatório para pacientes fora de São Paulo.\n";
        $txt .= "- Para cirurgias temos a opção de parcelamento em até 21x no cartão.\n";
        $txt .= "- Temos também a opção de pagamento através de *boleto bancário*.\n";
        $txt .= "- Nossas avaliações são feitas no espaço do *Instituto.arc*, localizado na Rua Estados Unidos, 56 - Jardins - São Paulo\n\n";

        if (!$this->isOpen) {//-ESTAMOS RESPONDENDO
            $txt .= "Nosso horário de atendimento é de segunda a sexta das 9h00 às 18h00.\n";
            $txt .= "Diga quais são suas dúvidas que responderemos assim que estivermos on-line.\n\n";
        }

        $txt .= "Enquanto aguarda seu atendimento, aproveite para conferir os impressionantes resultados das nossas cirurgias no antes e depois – basta clicar no link abaixo!\n";

        //-GLOBAL
        $this->zapLink->sendLink([
            'instance' => "recepcao",
            'phone' => $phone,
            'message' => $txt,
            'image' => "https://arcapp.com.br/img/zap/zap01_02.jpg",
            'linkUrl' => "https://institutoarc.com.br/plastica?ads=Ng",
            'linkDescription' => "Núcleo de Cirurgia Plástica",
        ]);

        return true;
    }

    /** //-ZAP SEGUIR INSTAGRAM
     * @param mixed $phone
     * @param mixed $leadContactLinksSent
     * @return void
     */
    public function sendFollowInstagram($phone = null, $leadContactLinksSent)
    {
        //-SE JÁ É UM REGISTRO CADASTRADO RETORNA
        if (!$leadContactLinksSent) {
            return;
        }

        //-TELEFONE
        $phone ??= $this->request->getVar()->phone;

        //=INICIA MENSAGEM
        $txt = "Olha só essa dica!!!\n\n";
        $txt .= "Siga o nosso perfil do Instagram e ganhe uma sessão de Oxigenoterapia em nossa câmara hiperbárica no valor de 1.200,00 para qualquer cirurgia realizada em nosso centro cirúrgico\n\n";
        $txt .= "Basta clicar no link abaixo e seguir nosso perfil!\n";

        $this->zapLink->sendLink([
            'instance' => "recepcao",
            'phone' => $phone,
            'message' => $txt,
            'image' => "https://arcapp.com.br/img/logos/arc/zap_insta_02.jpg",
            'linkDescription' => "Ganhe uma sessão de Hiperbárica!",
            'linkUrl' => "https://instagram.com/instituto.arc",
        ]);
    }

    /** //-ZAP TESTE
     * @param mixed $phone
     * @param mixed $msg
     * @return bool
     */
    public function msgTeste($phone, $msg)
    {
        $this->zapLink->sendLink([
            'instance' => "recepcao",
            'phone' => $phone,
            'message' => $msg,
            'image' => "https://arcapp.com.br/img/logos/arc/arc_zap_01.jpg",
            'linkUrl' => "https://institutoarc.com.br?ads=Ng",
            'linkDescription' => "Centro Cirúrgico & Hospital Dia",
        ]);

        return true;
    }
}
