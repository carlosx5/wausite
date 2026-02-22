<?php

namespace App\Controllers\Whatsapp\Console;

use App\Controllers\BaseController;
use App\Libraries\Whatsapp\ZapGetContactPicture;
use App\Libraries\Whatsapp\ZapSendText;
use App\Libraries\Whatsapp\ZapSendLink;
use App\Models\Whatsapp\Contact\ZapContact_Model;
use App\Models\Whatsapp\Message\ZapMessage_Model;
use App\Models\Marketing\Lead\LeadRegister_Model;
use App\Models\Config\Config_Model;

class Console extends BaseController
{
    private $libWhatsapp;
    private $libZapSendText;
    private $modZapContact;
    private $modZapMessage;
    private $modLead;
    private $modConfig;

    public function __construct()
    {
        $this->libWhatsapp = new ZapGetContactPicture();
        $this->libZapSendText = new ZapSendText();
        $this->modZapContact = new ZapContact_Model();
        $this->modZapMessage = new ZapMessage_Model();
        $this->modLead = new LeadRegister_Model();
        $this->modConfig = new Config_Model();
    }

    /** //-INDEX */
    public function index()
    {
        $this->initBackend(161);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Whatsapp',
            'viewTitle' => 'Whatsapp',
            'contenList' => [
                'whatsapp/console/sidebar_0',
                'whatsapp/console/sidebar_1',
                'whatsapp/console/sidebar_2'
            ],
        ]);

        $data = $this->dataCreate(
            'whatsapp/console/console',
            'whatsapp/console/console',
            'whatsapp_console'
        );

        return (viewShow('whatsapp/console/console', $data));
    }

    /** //+BUSCA DADOS */
    public function getData()
    {
        $this->initFetch(161);

        $getChoice = $this->request->getVar('getChoice');
        $contactPhone = $this->request->getVar('contactPhone');

        //:BUSCA LISTA DE CONTATOS
        if (in_array('contacts', $getChoice)) {
            $data['contactList'] = $this->getContactList();
        }

        //:BUSCA LISTA DE MENSAGENS
        if (in_array('messages', $getChoice)) {
            $data['messageList'] = $this->getMessageList($contactPhone);
        }

        //:BUSCA FOTO DO CONTATO
        $data['contactPicture'] = $this->libWhatsapp->getContactPicture('recepcao', $contactPhone)->link;

        //:BUSCA CONFIG
        $data['config'] = $this->getConfig();

        dieJson(200, $data);
    }

    /** //-BUSCA LISTA DE CONTATOS */
    public function getContactList()
    {
        return $this->modZapContact->select('
            ml.id,
            ml.phone,
            ml.name,
            whatsapp_contacts.ord,
            whatsapp_contacts.status
        ')
            ->join('marketing_leads ml', 'ml.id = whatsapp_contacts.id')
            ->orderBy('ord', 'DESC')
            ->findAll(100);
    }

    /** //-BUSCA LISTA DE MENSAGENS */
    public function getMessageList($contactPhone)
    {
        return $this->modZapMessage->select("
            text,
            text_title,
            text_description,
            text_url,
            text_thumbnailUrl,
            image_url,
            external_url,
            reaction_value as reaction,
            fromMe,
            datetime,
        ")
            ->where('phone', $contactPhone)
            ->orderBy('id', 'DESC')
            ->findAll(30);
    }

    /** //-BUSCA CONFIG
     * @return array
     */
    public function getConfig()
    {
        $resp['btnIaStatus'] = $this->modConfig->find('btnIaStatus')->value;

        return $resp;
    }

    /** //+ATUALIZA STATUS */
    public function updateStatus()
    {
        $contactId = $this->initFetch(162, 'contactId');

        $status = $this->request->getVar('status');

        $resp = $this->modZapContact->protect(false)->update($contactId, ['status' => $status]);

        dieJson(200, $resp);
    }

    /** //+VERIFICA SE OUVE ALGUM EVENTO */
    public function checkIfThereIsNewMessage()
    {
        $this->initFetch(161);

        $contactLastOrd = $this->request->getVar('contactLastOrd');

        $data['lastOrd'] = $this->modZapContact->getLastOrd();
        $data['contactLastOrd'] = $this->modZapContact->getLastOrdContact($contactLastOrd);

        return $this->json(200, $data);
    }

    /** //+ENVIA MENSAGEM */
    public function sendMessage()
    {
        $this->initFetch(162);

        $phone = $this->request->getVar('phone');
        $message = $this->request->getVar('message');

        $instance = 'recepcao';
        $resp = $this->libZapSendText->sendText($instance, $phone, $message);

        dieJson(200, $resp);
    }

    /** //+SALVA ALTERAÇÕES DE CONTATO */
    public function saveContact()
    {
        $contactId = $this->initFetch(162, 'contactId');

        $name = $this->request->getVar('name');

        $data = [
            'name' => $name,
        ];

        $resp = $this->modLead->protect(false)->update($contactId, $data);

        dieJson(200, $resp);
    }

    /** //+ENVIA LINK */
    public function sendLink()
    {
        $this->initFetch(9);

        //ENVIA MENSAGEM POR ZAP
        $zap = new ZapSendLink();
        $zapInstance = 'recepcao';
        //
        $cel = '5511989497692';
        $url = "https://institutoarc.com.br";
        //
        $dt = date_create('2024-06-11 11:00');
        $day = date_format($dt, "d/m/Y");
        $hour = date_format($dt, "H:i");
        //
        $linkDescription = 'Confirmação de agenda';
        $message = "Paciente: Teste Carlos\nComunicamos que seu agendamento está confirmado para o dia {$day} às {$hour}hs\n";
        //
        $resp = $zap->sendLink([
            'instance' => $zapInstance,
            'phone' => $cel,
            'message' => $message,
            'linkDescription' => $linkDescription,
        ]);

        dieJson(200, $resp);
    }

    /** //+ENVIA LINK PARA PAGINA DE IA DO SITE */
    public function sendLinkIa()
    {
        $this->initFetch(9);

        $phone = $this->request->getVar('phone');

        $zap = new ZapSendLink();
        $instance = 'recepcao';
        $message = "Clique no link abaido p/ ativar a IA de respostas.\n";
        $linkDescription = "";
        $linkUrl = "https://institutoarc.com.br/wau" . base64url_encode($phone);

        $resp = $zap->sendLink([
            'instance' => $instance,
            'phone' => $phone,
            'message' => $message,
            'linkDescription' => $linkDescription,
            'linkUrl' => $linkUrl,
        ]);

        dieJson(200, $resp);
    }

    /** //+SALVA STATUS DO BOTAO DE IA */
    public function setBtnIa()
    {
        $this->initFetch(168);
        $btnIaStatus = $this->request->getVar('btnIaStatus');

        //:BUSCA "btnIaStatus" EM BD E COMPARA COM ATUAL
        $BtnIaStatus_old = $this->getConfig()['btnIaStatus'];
        //:SE NÃO FOR IGUAL RETORNA
        if ($BtnIaStatus_old != $btnIaStatus) {
            $resp['config']['btnIaStatus'] = $BtnIaStatus_old;
            dieJson(200, $resp);
        }

        //:NOVO VALOR
        $BtnIaStatus_new = $btnIaStatus == 1 ? 0 : 1;

        //:SALVA "btnIaStatus"
        $this->modConfig->protect(false)->update('btnIaStatus', ['value' => $BtnIaStatus_new]);

        //:BUSCA "btnIaStatus" ATUALIZADO
        $resp['config']['btnIaStatus'] = $this->getConfig()['btnIaStatus'];

        dieJson(200, $resp);
    }
}
