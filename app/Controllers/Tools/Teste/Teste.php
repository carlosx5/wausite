<?php

namespace App\Controllers\Tools\Teste;

use App\Controllers\ViewController;
use App\Libraries\Whatsapp\ZapGetQrCode;
use App\Libraries\Whatsapp\ZapSendButton;
use App\Libraries\Whatsapp\ZapSendLink;
use App\Libraries\Pdf\DompdfLib;
use App\Libraries\RecordValidate\ClinicValidate;

class Teste extends ViewController
{
    private $modQr;
    private $modZap;
    private $zapLink;
    private $pdf;
    private $tcpdf;
    private $libPdf;
    private $libClinicValidate;

    public function __construct()
    {
        // parent::__construct();
        // $this->modQr = new ZapGetQrCode();
        // $this->modZap = new ZapSendButton();
        // $this->zapLink = new ZapSendLink();
        // $this->libPdf = new DompdfLib();
    }

    public function index()
    {
        // $this->idx13();



        $sendZap = new \App\Libraries\ZapGti\SendText();
        $date = date('d/m H:i:s');
        $resp = $sendZap->index('5511947614485', '5511989497692', "Teste -> $date");

        dieJson(200, $resp);
    }

    public function idx14()
    {
        $curl = curl_init();

        $data = [
            "to" => "5511989497692",
            "text" => "Olá, esta é uma mensagem via PHP cURL!"
        ];

        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://apivip.gti-api.com/message/sendText/5511947614485',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => array(
                'Content-Type: application/json',
                'Authorization: Bearer 1869F6CD-507F-4ECA-B34E-35AC4AD361CA'
            ),
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            echo $response;
        }
    }

    public function idx13()
    {
        $url = "https://apivip.gti-api.com/message/sendText/5511947614485";

        // Dados da mensagem
        $data = [
            "number"    => "5511989497692",
            "text"      => "Teste ok!!!"
        ];

        $body = json_encode($data);

        // Inicializa o cURL
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                "apikey: 1869F6CD-507F-4ECA-B34E-35AC4AD361CA"
            ],
            CURLOPT_POSTFIELDS => $body,
        ]);
        $resp = json_decode(curl_exec($ch), true);
        curl_close($ch);

        dj($resp);
    }

    //:GERA id_display PARA QUE NÃO TEM
    public function idx11()
    {
        dj('PARADO!');

        $mod = new \App\Models\User\Register\UserRegister_Model();

        $clinicId = 7;

        $data = (object) $mod
            ->select('id, id_clinic, id_display')
            ->where('id_clinic', $clinicId)
            ->where('id_display', '')
            ->orderBy('id', 'ASC')
            ->findAll(5000);

        //:Busca último id
        $lastId = $mod->select('id_display')
            ->where('id_clinic', $clinicId)
            ->where('id_display >', '')
            ->orderBy('id', 'DESC')
            ->first();

        //:Vazio (deve ser o primeiro registro) ? "0" : explode e pega apenas o id em id_display
        $lastId = empty($lastId)
            ? '0'
            : explode('-', $lastId->id_display)[0];
        $lastId = intval($lastId);

        foreach ($data as $key => $dt) {
            //:Gera id_display
            $newId = ++$lastId;
            $dtInput = [
                'id_display' => "{$newId}-{$clinicId}"
            ];

            //:Atualiza
            try {
                $mod->protect(false)->update($dt->id, $dtInput);
            } catch (\Throwable $e) {
                dieJson(400, 'Erro ao salvar: ' . $e->getMessage());
            }
        }




        dj($lastId);
    }

    //:ASSINATURA DIGITAL
    public function idx10()
    {
        $data = [
            'token' => "b8df0cce268c7da5e64e452fac78130ad7ed4818dd7a7bc9e98452753e6bbfbc",
            'filePath' => FCPATH . "teste01.pdf",
            'documentName' => "Autorização de exames",
            'signers' => [
                [
                    'email' => 'amandainfo100@gmail.com',
                    'action' => 'SIGN',
                    'name' => 'Carlos Vieira'
                ],
            ],
        ];

        $resp =  \App\Libraries\ElectronicSignature\Autentique::render($data);

        echo "<pre>";
        print_r($resp);
        echo "</pre>";

        if (isset($resp['data']['createDocument']['id'])) {
            echo "Documento enviado! ID: " . $resp['data']['createDocument']['id'];
        } else {
            echo "Erro ao enviar documento!<br>";
            if (isset($resp['errors'])) {
                foreach ($resp['errors'] as $error) {
                    echo $error['message'] . "<br>";
                }
            }
        }
    }

    /** //-Paleta de cores */
    public function idx08()
    {
        $this->initBackend(9);
        session()->setFlashdata('sidebar', [
            'menuActive' => '',
            'viewTitle' => '',
            'contenList' => [],
        ]);

        $uri = uri_string();
        $data = $this->dataCreate(
            ['tools/teste/paletaCores/paletaCores'],
            [
                'tools/teste/paletaCores/colorPaletteMain',
                'tools/teste/paletaCores/paletaCores',
            ],
            'teste'
        );

        return viewShow('tools/teste/paletaCores/paletaCores', $data);
    }

    /** //-SimpleMDE */
    public function idx07()
    {
        $this->initBackend(9);
        session()->setFlashdata('sidebar', [
            'menuActive' => '',
            'viewTitle' => '',
            'contenList' => [],
        ]);

        $uri = uri_string();
        $data = $this->dataCreate(
            [
                'p-simpleMde.v1112',
                'patient/record/record'
            ],
            [
                'p-simpleMde.v1112',
                'patient/record/record'
            ],
            'teste'
        );

        return viewShow('patient/record/record', $data);
    }

    public function getTeste()
    {
        // $data['teste'] = file_get_contents(base_url('assets/js/cropper/teste.js'));
        $codigoJS = file_get_contents(base_url('assets/js/cropper/teste.js'));

        return $this->response
            ->setHeader('Content-Type', 'text/plain')
            ->setBody($codigoJS);

        // return $this->json(200, $data);
    }

    /** //-PDF3 = "fpdf" */
    public function idx05()
    {


        $text = "
        Prontuário Médico\n\n

        Paciente: Adriana Bernardo Seara  
Médico Responsável: Dr. José Ebram  
Data do Atendimento: 14 de julho de 2023  

        Histórico Médico:
- Idade: 38 anos  
- IMC: Índice de Massa Corporal dentro da faixa de normalidade  
- Índice de Gordura Corporal: Adequado para a faixa etária  

        Queixa Principal (QP):
- Paciente relata ter realizado cesárea, redução de mama e tratamento para ATM.  

        Antecedentes Clínicos (AC):
- Cesárea prévia  
- Redução de mama  
- Disfunção Temporomandibular (ATM)  

        Antecedentes Pessoais (AP):
- Moradora da região de Higienópolis, São Paulo  

        Exames Complementares e Diagnósticos:
- Sono: Dentro dos padrões normais  
- Níveis de Estresse: Controlados  
- Atividade Física: Realizada 4 vezes por semana  
- Hidratação: Adequada  
- Controle da Compulsão Alimentar: Estável  

        Hábitos Alimentares:
- Café da Manhã (8:30): Ovos acompanhados de café puro  
- Almoço (12h): Batata, salada, proteína, sobremesa de fruta  
- Lanche da Tarde (15h): Tapioca  
- Jantar (19h): Refeição composta por grelhado e legumes  

        Medicações Prescritas:
- Rybelsus  
- Synthroid  
- Morosil  
- Mitburn  

        Observações: A paciente encontra-se em acompanhamento médico regular, seguindo orientações quanto à alimentação e medicação prescrita. Próxima consulta agendada para 3 meses.  

        Assinatura:  
Dr. José Ebram  
CRM xx.xxx  
Data: 14 de julho de 2023  
        ";

        $data['content'] = $text;
        $html = view("tools/teste/pdf.html", $data);
        $filename = "teste_pdf.pdf";
        $output = "I";

        echo (view("tools/teste/pdf_v", $data));
        return;

        // Gera o PDF e exibe no navegador (modo inline)
        return $this->libPdf->renderPDF($html, $filename, $output);
    }

    /** //-Pega nome e telefone no BD e salva no formato TXT */
    public function idx02()
    {
        $mod = new \App\Models\Patient_register_Model;

        $usuarios = $mod->select('id, name, phone_number')->findAll();

        $caminho = WRITEPATH . 'exports/'; // Pasta: writable/exports/
        if (!is_dir($caminho)) {
            mkdir($caminho, 0777, true); // Cria a pasta se não existir
        }

        $arquivo = $caminho . 'usuarios_' . date('Ymd_His') . '.txt';
        $conteudo = '';

        foreach ($usuarios as $usuario) {
            // Monta o conteúdo do arquivo
            $conteudo .= "ID: {$usuario['id']}, Nome: {$usuario['name']}, Telefone: {$usuario['phone_number']}\n";
        }

        // Salva o conteúdo no arquivo
        file_put_contents($arquivo, $conteudo);

        return "Arquivo salvo em: $arquivo";
    }

    /** //-Pega o QRCode do Z-API */
    public function idx01()
    {

        $this->initBackend(9);
        session()->setFlashdata('sidebar', [
            'menuActive' => '',
            'viewTitle' => '',
            'contenList' => [],
        ]);

        $uri = uri_string();
        $data = $this->dataCreate(
            ['tools/teste'],
            ['tools/teste'],
            'teste'
        );

        $respCurl = $this->modQr->getQrCode('sistema');
        $data['base64'] = isset($respCurl->value) ? $respCurl->value : 'conected';

        return viewShow('tools/teste/qrcode', $data);




        dj('PARADO!');

        $mod = new \App\Models\Bank\Bank_locked_day_Model();

        $array = $mod->find();

        foreach ($array as $arr) {
            $id = $arr->id;
            $date = $arr->date;
            $week = dateWeek($date)['int'];
            $mod->protect(false)->update($id, ['week' => $week]);
        }

        $array = $mod->find();
        dj($array);






        dj(dateWeek('2024-10-23')['int']);

        $a = base64url_encode(8);
        // $a = base64url_decode("MTA");

        dj($a);




        $id = 8;
        $resp1 = str_pad($id, 7, "0", STR_PAD_LEFT);
        $resp1 = base64url_encode($resp1);
        $resp2 = base64url_decode($resp1);

        dj("$resp1 $resp2");
    }

    public function btn1()
    {
        $phone = '5511989497692';
        $message = 'Selecione um procedimento:';
        $buttonList = [
            [
                "id" => "1",
                "label" => "Ruim"
            ],
            [
                "id" => "2",
                "label" => "Bom"
            ],
            [
                "id" => "3",
                "label" => "Ótimo"
            ],
            [
                "id" => "4",
                "label" => "Excelente"
            ]
        ];

        $this->modZap->sendButton('recepcao', $phone, $message, $buttonList);

        dieJson(200, 'TESTE OK');
    }

    public function xxindex()
    {
        helper('strpos');

        $result = strposAll(
            'Olá! Tenho interesse e queria mais informações, por favor.',
            ['tenho', 'interesse', 'queria', 'mais informa']
        );

        dj($result);



        // dj('DIE');


        // $data = \App\Libraries\Tools\CountryData::data();
        // $modCountry = new \App\Models\Country\Country_Model();

        // foreach ($data as $key => $d) {
        //     $data[$key]['url'] = str_replace("https:////upload.wikimedia.org/wikipedia/commons/thumb/", '', $d['img']);

        //     $modCountry->protect(false)->save([
        //         'ddi' => $d['ddi'],
        //         'country' => $d['pais'],
        //         'continent' => $d['continente'],
        //         'img' => str_replace("https:////upload.wikimedia.org/wikipedia/commons/thumb/", '', $d['img']),
        //     ]);
        // }

        // die(json_encode($data));
    }

    public function corrigeUserStatus()
    {
        $this->initBackend(9);

        $modUsers = new \App\Models\User\User_register_Model();
        $modStatus = new \App\Models\User\UserStatus_Model();

        $resp = $modStatus
            ->select('id')
            ->findAll();

        foreach ($resp as $key => $vl) {
            $q = $modUsers->select('id');
            $resp2 = $q->find($vl->id);
            if (!$resp2) {
                echo (json_encode(['id' => $vl->id, 'resp' => $resp2]));
            };
        };
    }

    public function save()
    {
        $this->initFetch(9);
        helper('validate');

        $list = $this->request->getVar();

        return $this->json(200, $list);
    }

    public function indexXXXX()
    {
        $this->initBackend(9);
        dj('fim');

        $modPatient = new \App\Models\Patient_register_Model();
        $patient = $modPatient->select('id, name, name_short')->findAll();

        foreach ($patient as $key => $pa) {
            $explode = explode(' ', $pa['name']);
            $len = count($explode);
            //
            if ($len > 0) {
                $nameShort = $explode[0] . ' ' . $explode[$len - 1];
            };
            $patient[$key]['explode'] = $explode;
            $patient[$key]['result'] = $nameShort;

            $modPatient->protect(false)->update($pa['id'], ['name_short' => $nameShort]);
        };

        echo json_encode($patient);
        die;
    }
}
