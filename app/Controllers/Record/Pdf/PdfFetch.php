<?php

namespace App\Controllers\Record\Pdf;

use App\Controllers\Record\Pdf\Pdf_database;
use App\Libraries\Date\DatePeriodResult;
use App\Libraries\Pdf\DompdfLib;
use App\Libraries\ElectronicSignature\Autentique;

class PdfFetch extends Pdf_database
{
    //:ENVIA PDF PARA "AUTENTIQUE" PARA SER ASSINADO
    public function sendPdfForSignature()
    {
        $libDatePeriod = new DatePeriodResult();
        $pdfDatabase = new Pdf_database();
        $libPdf = new DompdfLib();

        $recordId = $this->request->getVar('recordId');

        //:Busca dados do prontuário
        $resp = $pdfDatabase->getData($recordId);
        //:Verifica se houve erro ao buscar os dados
        if ($resp->status !== 200)
            dieJson(400, $resp);

        $resp->record->profEmail = 'carlosvieirax5@gmail.com'; //! Força email p/ testes
        ///
        $data['clinicaName'] = $resp->record->clinicName;
        $data['profName'] = $resp->record->profName;
        $data['patientName'] = $resp->record->patientName;
        $data['patientBirthday'] = $resp->record->patientBirthday;
        $data['patientAge'] = $libDatePeriod->render($resp->record->patientBirthdayUS);
        $data['date'] = $resp->record->date;
        $data['procedure'] = $resp->record->procedureName;
        $data['content'] = $resp->content;

        //:Pdf já foi enviado para Autentique -> retorna dados p/ fetch
        if ($resp->record->id_autentique) {
            //:Checa dados do Autentique e retorna url do PDF original e assinado
            $data = $this->checkPdfAutentique($resp->record->id_autentique);
            dieJson(400, $data);
        }

        //:Renderiza o HTML do prontuário e gera PDF
        $html = view("record/pdf/recordPdf_v", $data);
        $libPdf->renderPDF($html, 'teste.pdf', 'F');

        //:Instancia a classe Autentique
        $autentique = new Autentique();

        //:Dados para enviar o PDF para assinatura
        $data = [
            'filePath' => FCPATH . "teste.pdf",
            'documentName' => "Prontuário",
            'signers' => [
                [
                    'email' => $resp->record->profEmail,
                    'action' => 'SIGN',
                    'name' => $resp->record->profName
                ],
            ],
        ];

        //:Envia o PDF para assinatura
        $respAutentique =  $autentique->sendPdfForSign($data);

        //:Se a assinatura for bem sucedida, salva os dados no banco
        $dataset = [
            'id_autentique' => $respAutentique['data']['createDocument']['id'],
            'signature_status' => 1
        ];
        $resp = $pdfDatabase->setData($recordId, $dataset);

        dieJson(200, $resp);
    }

    //:VERIFICA SE PDF EXISTE EM AUTENTIQUE E RETORNA URL DO PDF ORIGINAL E ASSINADO
    private function checkPdfAutentique($autentiqueId)
    {
        $autentique = new Autentique();

        //:Busca os dados do Autentique
        $resp = $autentique->getUrlPdf($autentiqueId); //:Busca todos os dados do documento

        //:Verifica o array de "signatures" para ver se o PDF já foi assinado
        $pdfSigned = false;
        $profEmail = '';
        foreach ($resp['data']['document']['signatures'] as $signature) {
            if ($signature['signed'])
                $pdfSigned = true;

            if ($signature['action'])
                $profEmail = $signature['email'];
        }

        $data = [];
        $data['pdfId'] = $resp['data']['document']['id']; //:Id do documento
        $data['pdfUrlOriginal'] = $resp['data']['document']['files']['original']; //:Link do PDF original
        $data['pdfUrlSigned'] = $resp['data']['document']['files']['signed']; //:Link do PDF assinado
        $data['pdfSigned'] = $pdfSigned; //:Pdf foi assinado ou não
        $data['profEmail'] = $profEmail; //:Email enviado p/ assinatura

        return $data;
    }
}
