<?php

namespace App\Controllers\Record\Pdf;

use App\Controllers\BaseController;
use App\Models\Record\Register\RecordRegister_Model;
use App\Models\Record\Module\RecordModule_Model;

class Pdf_database extends BaseController
{
    private $modRecord;
    private $modRecordModule;

    public function __construct()
    {
        $this->modRecord = new RecordRegister_Model();
        $this->modRecordModule = new RecordModule_Model();
    }

    public function getData($recordId)
    {
        //:Busca dados do prontuário
        $record = $this->modRecord
            ->select("
                DATE_FORMAT(record.created_at, '%d/%m/%Y') as date,
                patient.name as patientName,
                patient.birthday as patientBirthdayUS,
                DATE_FORMAT(patient.birthday, '%d/%m/%Y') as patientBirthday,
                clinic.name_social as clinicName,
                CONCAT_WS(' ', prof.name_prefix, prof.name) as profName,
                prof.email as profEmail,
                procedure.name as procedureName,
                id_autentique
            ")
            ->join('clinic', 'clinic.id = record.id_clinic', 'left')
            ->join('patient', 'patient.id = record.id_patient', 'left')
            ->join('user prof', 'prof.id = record.id_prof', 'left')
            ->join('procedure', 'procedure.id = record.id_procedure', 'left')
            ->where('record.id', $recordId)
            ->first();

        //:Busca modulo PDF (id_file_type=20) do prontuário
        $module = $this->modRecordModule
            ->select("
                record__module.id,
                record__module.id_record,
                record__module.id_file_type,
                record__module.content,
            ")
            ->where('id_record', $recordId)
            ->where('id_file_type', 20)
            ->first();

        //:Módulo sem conteúdo -> retorna status 400
        if (empty($module->content))
            return (object)['status' => 400];

        //:Retorna dados do prontuário
        $data = (object)[
            'status' => 200,
            'record' => $record,
            'content' => $module->content
        ];
        ///
        return  $data;
    }

    public function setData($recordId, $data)
    {
        return $this->modRecord->protect(false)->update($recordId, $data);
    }
}
