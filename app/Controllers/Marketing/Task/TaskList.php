<?php

namespace App\Controllers\Marketing\Task;

use App\Controllers\Task\Register\TaskRegister;

class TaskList extends TaskRegister
{
    public function __construct()
    {
        // $this->modTaskReport = new TaskReport_Model();
    }

    //:Tela PC
    public function index()
    {
        $this->initBackend(9);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Marketing',
            'viewTitle' => 'Tarefas',
            'contenList' => ['marketing/task/sidebar'],
        ]);

        $uri = uri_string();
        $data = $this->dataCreate(
            "{$uri},task/register/taskRegister",
            "{$uri}",
            'taskList'
        );

        return (viewShow($uri, $data));
    }

    //.Busca data
    public function getData()
    {
        $registerId = $this->initFetch(54, 'registerId');

        $data['register'] = $this->getRegister($registerId);

        return $this->json(200, $data);
    }

    //:Busca registro
    private function getRegister($registerId)
    {
        return $this->modLoan->find($registerId);
    }

    //:Salva registro
    public function saveRegister()
    {
        $registerId = $this->initFetch(9, 'registerId');

        //*DATA
        $data = $this->request->getVar('data');
        //
        $data->id = $registerId;

        //*SALVA
        $registerId = $this->modLoan->saveWau($data);

        //*BUSCA REGISTRO SALVO
        $register['register'] = $this->getRegister($registerId);

        return $this->json(200, $register);
    }
}
