<?php

namespace App\Controllers\Tools\Refaz;

use App\Controllers\BaseController;

class Refaz extends BaseController
{
    /**//*SEPARA TABELA DE LEAD DE WHATSAPP */
    public function leadDuplicate()
    {
        dj('PAUSADO');

        $db = new \App\Models\Whatsapp\Contacts\Contacts_Model();

        //*BUSCA CADASTROS
        $result = $db->select('id, ord')->orderBy('ord')->findAll();

        //*REORGANIZA ID
        foreach ($result as $key => $res) {
            $db->protect(false)->where('id', $res->id)->set(['ord' => $key + 1])->update();
        };
    }

    /**//*REORGANIZA CONTATOS REMOVENDO NUMEROS DE TELEFONE REPETIDOS */
    public function contatoLead()
    {
        dj('PAUSADO');

        //*REORGANIZA MENSAGENS DE WHATSAPP
        $db = new \App\Models\Whatsapp\Contacts\Contacts_Model();

        //*REMOVE ID EM BRANCO
        $db->where('phone', '')->delete();

        //*BUSCA ID REPETIDOS
        $db->select('
            phone,
            Count(phone) as conta
        ');
        $db->groupBy(['phone']);
        $resp = $db->findAll();

        //*INICIO
        foreach ($resp as $key => $r) {
            if ($r->conta > 1) {
                //*BUSCA GRUPO DE "messageId" REPETIDOS
                $result = $db->select('id, phone')->where('phone', $r->phone)->find();

                foreach ($result as $key => $del) {
                    //*DELETA "messageId" REPETIDOS DEIXANDO APENAS O PRIMEIRO
                    if ($key > 0) {
                        echo($del->id . ' -> ' . $del->phone . '</br>');
                        $db->where('id', $del->id)->delete();
                    };
                };
            };
        };

        die;
    }

    /**//*MENSAGENS DE WHATSAPP */
    public function mensagemZap()
    {
        dj('PAUSADO');

        //*REORGANIZA MENSAGENS DE WHATSAPP
        $db = new Messages_Model();

        //*REMOVE ID EM BRANCO
        $db->where('messageId', '')->delete();

        //*BUSCA ID REPETIDOS
        $db->select('
            messageId,
            Count(messageId) as conta
        ');
        $db->groupBy(['messageId']);
        $resp = $db->findAll();

        //*INICIO
        foreach ($resp as $key => $r) {
            if ($r->conta > 1) {
                //*BUSCA GRUPO DE "messageId" REPETIDOS
                $result = $db->select('id, messageId')->where('messageId', $r->messageId)->find();

                foreach ($result as $key => $del) {
                    //*DELETA "messageId" REPETIDOS DEIXANDO APENAS O PRIMEIRO
                    if ($key > 0) {
                        echo($del->id . ' -> ' . $del->messageId . '</br>');
                        $db->where('id', $del->id)->delete();
                    };
                };
            };
        };

        die;
    }

    /**//*REFAZ MES DE FECHAMENTO DA TABELA "bank" */
    public function refazMesFechamento()
    {
        $this->initBackend(9);
        die;

        $q = db_connect()->table('bank');
        $q->select('
            id,
            description,
            date as date_us,
            month,
            DATE_FORMAT(date, "%Y-%m") as certo,
        ');
        $q->where('id_source', 4);
        $q->orderBy('date_us DESC, id DESC');
        $result = $q->get()->getResultArray();

        foreach ($result as $r) {
            if ($r['month'] != $r['certo']) {
                db_connect()->table('bank')
                    ->where('id', $r['id'])
                    ->update(['month' => $r['certo']]);
            };
        };

        echo json_encode($result);
        die;
    }
}
