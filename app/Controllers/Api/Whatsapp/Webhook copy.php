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
    }

    /** //-WEBHOOK DE RECEBIMENTO DE MENSAGENS */
    public function upNewMessage()
    {
        //:DATA
        $data = $this->request->getVar();

        if (isset($data->buttonsResponseMessage->buttonId)) {
            $msg = null;
            switch ($data->buttonsResponseMessage->buttonId) {
                case 1:
                    $msg = 'Template de Mamoplastia...';
                    break;
                case 2:
                    $msg = 'Template de Mastopexia...';
                    break;
                case 3:
                    $msg = 'Template de Mamoplastia Redutora...';
                    break;
                case 4:
                    $msg = 'Template de Lipoaspiração...';
                    break;
                case 5:
                    $msg = 'Aguardando atendente...';
                    break;
                default:
                    break;
            }

            if ($msg)
                $this->msgTeste($data->phone, $msg);

            die;
        }
        // $data->text->message = null;
        // arquiva([
        //     'messageId' => $data->messageId,
        //     'phone' => $data->phone,
        //     'message' => isset($data->text->message) ? $data->text->message : '',
        // ], "z");
        // arquiva($data, "z");

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

            //:NÃO ATUALIZA CONTATO NA TABELA LEADS

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

        //:INICIA ENVIO DE MENSAGENS AUTOMÁTICAS
        if (!$data->fromMe) {
            $resp = $this->aiMessage(
                $data->text->message,
                $data->phone
            );

            if (!$resp) {
                $result1 = $this->strposAll(
                    $data->text->message,
                    ['gostaria', 'mais', 'informa']
                );

                $result2 = $this->strposAll(
                    $data->text->message,
                    ['tenho', 'interesse', 'informa']
                );

                if ($leadContactLinksSent) {
                    $resp = null;

                    // if (isset($data->externalAdReply->title) && strpos($data->externalAdReply->title, '#') !== false) {
                    //     $resp = $this->AutoMsg_1021($data->phone);
                    // } else 
                    if ($result1 || $result2) {
                        if (substr($data->phone, 0, 1) == 1) {//.ZAP SE FOR USA
                            $resp = $this->ZapUSA($data->phone);
                        } else if (substr($data->phone, 0, 4) == 5511) {//.ZAP SE FOR SP
                            $resp = $this->ZapSP($data->phone);
                        } else {//.ZAP SE FOR FORA DE SP
                            $resp = $this->ZapOutSP($data->phone);
                        }
                    }

                    if ($resp) {
                        //:!ZAP DE SEGUIR NO INSTAGRAM
                        // $this->sendFollowInstagram($data->phone, $leadContactLinksSent);

                        //:ZAP DE AUDITORIA
                        $audit = new Audit();
                        $audit->sendCarlosZap(".arc - $data->phone: {$this->modLead->getInsertID()} - $data->chatName");
                    }

                    //!ZAP DE AUDITORIA TEMPORARIO
                    // $audit = new Audit();
                    // $audit->sendCarlosZap(".arc - $data->phone: {$this->modLead->getInsertID()} - $data->chatName");
                }
            }

            $result3 = $this->strposAll(
                $data->text->message,
                ['teste9']
            );

            if ($result3) {
                $phone = $data->phone;
                $message = 'Selecione um procedimento:';
                $buttonList = [
                    [
                        "id" => "1",
                        "label" => "Mamoplastia"
                    ],
                    [
                        "id" => "2",
                        "label" => "Mastopexia"
                    ],
                    [
                        "id" => "3",
                        "label" => "Mamoplastia Redutora"
                    ],
                    [
                        "id" => "4",
                        "label" => "Lipoaspiração"
                    ],
                    [
                        "id" => "5",
                        "label" => "Falar com atendente"
                    ]
                ];

                $this->zapButton->sendButton('recepcao', $phone, $message, $buttonList);
            }
        }

        //:RETORNO DAS TABELAS
        $result = [
            'saveLeadContact' => $saveLeadContact,
            'saveZapContact' => $saveZapContact,
            'saveZapMessage' => $saveZapMessage
        ];

        //*DEBUG - SALVA EM ARQUIVOS
        //:DEBUG SALVA MENSAGEM
        if ($data->phone == '5511989497692') {
            // arquiva($data, "Webhook_Carlos");
        }
        if (!$data->fromMe) {
            arquiva($data, "Webhook");
        }

        dieJson(200, $result);
    }

    /** //-CHECA ENVIO DE MENSAGEM
     * @param string $string
     * @param array $find
     * @param bool|string $response
     * @param bool|string $bot
     * @param bool|string $offLineMsg
     * @return bool|string
     */
    private function strposAll($string, $find, $response = true, $bot = false, $offLineMsg = false)
    {
        //:PASSA P/ MINUSCULO
        $string = strtolower($string);

        //:REMOVE ACENTUAÇÃO
        $string = preg_replace(
            ["/(á|à|ã|â|ä)/", "/(é|è|ê|ë)/", "/(í|ì|î|ï)/", "/(ó|ò|õ|ô|ö)/", "/(ú|ù|û|ü)/", "/(ç)/", "/(ñ)/"],
            explode(" ", "a e i o u c n"),
            $string
        );

        //:COMPARA
        foreach ($find as $value) {
            $exists = false;
            $value = strtolower($value);
            $value = explode('|', $value);

            foreach ($value as $val) {
                $ok = strpos(
                    $string,
                    $val
                ) !== false;

                if ($ok)
                    $exists = true;
            }

            if (!$exists)
                return $exists;
        }

        //:SE FOR FORA DE HORARIO E TEIVER UMA MSG PERSONALIZADA PARA FORA DE HORARIO
        if (!$this->isOpen && $offLineMsg)
            $response = $offLineMsg;

        //:SE A RESPOSTA DEVE SER IDENTIFICADA COMO VINDA DE UM "BOT"
        if ($bot)
            $response = "*Instituto.arc:*\n$response";

        return $response;
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
    public function aiMessage($ask, $phone)
    {
        //!TEMPORARIO
        $phoneCompare = str_replace(
            '5511',
            '',
            $phone
        );

        if (!is_int(strpos('989497692-983147083-952090858-988944815-945211631-945966958', $phoneCompare))) {
            // return false;
        }
        //!TEMPORARIO

        $btnIaStatus = $this->modConfig->find('btnIaStatus')->value;
        if ($btnIaStatus != 1)
            return false;

        $resp = false;

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['fala|hora', 'abre|fecha|atend|pessoa|funcionari|medic|gerente'],
                "Estamos aqui para te atender de segunda a sexta, das 9h às 18h.",
                true
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['qual|onde|preciso|quero|da', 'endereco|fica'],
                "Nossa clínica está localizada em uma área super agradável, no coração do Jardins. Venha nos visitar na Rua Estados Unidos, 56, no Jardim Paulista, São Paulo. Será um prazer recebê-la!",
                true
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['preco|valor|qto|quant|sobre', 'consult|avalia'],
                "O valor da avaliação é de R$ 300,00, sendo R$ 150,00 pagos no agendamento e R$ 150,00 no dia da avaliação. Esse valor será descontado do custo total da cirurgia, caso ela seja realizada.",
                true
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['preco|valor|qto|quant', 'masto|maxto', 'sem'],
                "Geralmente, o valor da mastopexia sem prótese gira em torno de R$ 20.000,00. No entanto, para que possamos oferecer um orçamento exato, é importante agendar uma consulta com o médico cirurgião, que fará uma avaliação personalizada das suas necessidades.",
                true
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['preco|valor|qto|quant', 'masto|maxto'],
                "Em média, o valor da mastopexia gira em torno de R$ 20.000, mas para saber o orçamento exato, precisamos que você agende uma consulta com o nosso médico cirurgião. Assim, ele poderá avaliar suas necessidades de forma personalizada.",
                true
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['preco|valor|qto|quant', 'mamop|protese'],
                "Normalmente, o valor da mamoplastia gira em torno de R$ 15.000, mas esse número pode variar conforme as suas necessidades específicas. Para oferecer um orçamento mais preciso e personalizado, é essencial agendar uma consulta com o médico cirurgião.",
                true
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['preco|valor|qto|quant', 'lipo', 'hd'],
                "Em média, o valor da lipo-HD fica em torno de R$ 50.000, mas esse número pode variar conforme as suas necessidades. Para que possamos fornecer um orçamento exato e personalizado, o ideal é agendar uma consulta com o nosso médico cirurgião.",
                true
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['preco|valor|qto|quant', 'lipo'],
                "Em geral, o valor da lipoaspiração comum gira em torno de R$ 40.000, mas para oferecer um orçamento exato e personalizado, precisamos que você agende uma consulta com o nosso médico cirurgião. Durante essa consulta, ele avaliará suas necessidades específicas e esclarecerá todas as suas dúvidas.",
                true
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['orar', 'atend|funciona|consul|abre'],
                "Estamos aqui para te atender de segunda a sexta, das 9h às 18h. E para sua comodidade, há um estacionamento bem em frente à nossa clínica.",
                true
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['forma', 'paga|parcela'],
                "Para facilitar o seu planejamento, oferecemos pagamento em até 21 vezes sem juros no cartão. Também há a opção de boleto bancário para cirurgias programadas.",
                true
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['tem|pos', 'uti'],
                "Nosso hospital conta com um centro cirúrgico exclusivo, garantindo um ambiente seguro e controlado para cada procedimento. Além disso, um dos nossos grandes diferenciais é que a UTI fica totalmente reservada para o paciente que está realizando a cirurgia, proporcionando um atendimento ainda mais personalizado, tranquilo e seguro.",
                true
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['qual|quais', 'ospita'],
                "O *Instituto.arc* tem um hospital próprio, totalmente equipado para oferecer o máximo de segurança e conforto aos nossos pacientes. Além disso, contamos com parcerias estratégicas com alguns dos hospitais mais renomados, como *São Luiz*, *Dom Alvarenga*, *Premium Day Hospital*, *Blanc*, entre outros. Nosso compromisso é garantir que cada procedimento seja realizado com excelência, em ambientes de alta qualidade e segurança.",
                true
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['marca|agenda|quer|quando|qdo|tem', 'consul|agenda'],
                "Aguarde só um momentinho! Nossa consultora já vai te atender com toda atenção e carinho para tirar suas dúvidas com o seu agendamento. 💕😊",
                true,
                "Nosso horário de atendimento é de segunda a sexta, das 9h às 18h. Assim que estivermos online, uma de nossas consultoras irá te atender com todo cuidado e atenção para te ajudar no seu agendamento. Se precisar, pode nos deixar uma mensagem, e responderemos o mais rápido possível! 💕😊"
            );
        }

        if (!$resp) {
            $resp = $this->strposAll(
                $ask,
                ['aceita|faz', 'plano', 'saude'],
                "Nós não trabalhamos com planos de saúde para as cirurgias, mas você pode utilizar seu plano para a realização dos exames pré-operatórios. Se tiver alguma dúvida, nossa equipe está à disposição para te ajudar em cada etapa do processo! 💕😊",
                true
            );
        }

        if (!$resp) {
            return false;
        }

        $this->zapText->sendText(
            "recepcao",
            $phone,
            $resp,
        );

        return true;
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
