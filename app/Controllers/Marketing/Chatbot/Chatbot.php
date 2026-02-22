<?php

namespace App\Controllers\Marketing\Chatbot;

use App\Controllers\BaseController;
use App\Models\Marketing\Chatbot\Chatbot_Model;

class Chatbot extends BaseController
{
    private $modChatbot;

    public function __construct()
    {
        $this->modChatbot = new Chatbot_Model();
    }

    public function index()
    {
        $this->initBackend(69);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Marketing',
            'viewTitle' => 'ChatBot',
            'contenList' => ['marketing/chatbot/sidebar'],
        ]);

        $uri = uri_string();
        $data = $this->dataCreate(
            $uri,
            $uri,
            'chatbot'
        );

        return viewShow($uri, $data);
    }

    public function get($id = null)
    {
        if (!$id) {
            $id = $this->initFetch(9, 'id');
        }

        $id = $this->initFetch(9, 'id');

        $resp = $this->modChatbot->find($id);

        dieJson(200, $resp);
    }

    public function setChatbot()
    {
        $id = $this->initFetch(9, 'id');

        $resp = $this->modChatbot->saveWau([
            'id' => $id,
            'id_father' => 0,
            'message' => $this->request->getVar('message'),
        ]);

        dieJson(200, $this->get($id));
    }
}