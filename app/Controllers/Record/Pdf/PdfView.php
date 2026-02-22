<?php

namespace App\Controllers\Record\Pdf;

use App\Controllers\BaseController;
use App\Controllers\Record\Pdf\Pdf_database;
use App\Libraries\Date\DatePeriodResult;
use App\Libraries\Pdf\DompdfLib;

/**
 * 
 * :Controller para gerar PDF para visualização e impressão de prontuário
 * 
 */
class PdfView extends BaseController
{
    public function index()
    {
        $registerId = getCook('printId');
        $pdfDatabase = new Pdf_database();
        $libDatePeriod = new DatePeriodResult();
        $libPdf = new DompdfLib();

        //:Cria dados para o PDF
        $resp = $pdfDatabase->getData($registerId);
        $data['clinicaName'] = $resp->record->clinicName;
        $data['profName'] = $resp->record->profName;
        $data['patientName'] = $resp->record->patientName;
        $data['patientBirthday'] = $resp->record->patientBirthday;
        $data['patientAge'] = $libDatePeriod->render($resp->record->patientBirthdayUS);
        $data['date'] = $resp->record->date;
        $data['procedure'] = $resp->record->procedureName;
        $data['content'] = $resp->content;

        //:Cria HTML
        $html = view("record/pdf/recordPdf_v", $data);

        //:Renderiza PDF
        $libPdf->renderPDF($html, 'teste.pdf', 'I');
    }
}
