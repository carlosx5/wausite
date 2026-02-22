<?php

namespace App\Controllers\Modules;

use CodeIgniter\Controller;

class Modules extends Controller
{
    /**
     * Métoto para enviar o template de busca
     * @param string $type = NUMERO QUE VAI NO FINAL DO ARQUIVO HTML ("findModalCol" + $type + ".html")
     * @return array $template (JSON)
     */
    public function find($type)
    {
        $template = view("modules/findModalCol{$type}.html");
        echo json_encode(['status' => 200, 'template' => $template]);
        die;
    }

    /**
     * Métoto para enviar o template de cadastro de "bank" e "bank_link"
     */
    public function bank_register()
    {
        $template = view("modules/bank/bank_register_module.html");
        echo json_encode(['status' => 200, 'template' => $template]);
        die;
    }

    /**
     * Métoto para enviar o template de edição de calendario
     */
    public function calendar_patient_module()
    {
        $template = view("modules/calendar/calendar_patient_module.html");
        echo json_encode(['status' => 200, 'template' => $template]);
        die;
    }

    /**
     * Métoto para enviar o template de edição de médico em calendario
     */
    public function calendar_doctor_module()
    {
        $template = view("modules/calendar/calendar_doctor_module.html");
        echo json_encode(['status' => 200, 'template' => $template]);
        die;
    }

    /**
     * Métoto para enviar o template de opções de salas em calendario
     */
    public function calendar_room_module()
    {
        helper('calendar_room_helper');

        $template = view("modules/calendar/calendar_room_module.html");
        $btns = room_data();

        echo json_encode(['status' => 200, 'template' => $template, 'btns' => $btns]);
        die;
    }

    /**
     * Métoto para enviar o template de menu do dia
     */
    public function calendar_menuDay_module()
    {
        $template = view("modules/calendar/calendar_menuDay_module.html");
        echo json_encode(['status' => 200, 'template' => $template]);
        die;
    }

    /**
     * Métoto para enviar o template de resumo de os
     */
    public function os_summary()
    {
        $template = view("modules/os_summary_module.html");
        echo json_encode(['status' => 200, 'template' => $template]);
        die;
    }

    /**
     * Métoto para enviar o template de vídeos
     */
    public function videos()
    {
        $template = view("modules/videos_module.html");
        echo json_encode($template);
        die;
    }
}
