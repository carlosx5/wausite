<?php

namespace App\Libraries\ElectronicSignature;

use vinicinbgs\Autentique\Documents;

/**
 * 
 * :Classe para manipulação de assinatura digital usando "Autentique".
 * 
 * :Painel do Autentique: https://painel.autentique.com.br/documentos/todos
 * 
 * :Instalar instancia via composer: composer require vinicinbgs/autentique-v2
 * :Github: https://github.com/vinicinbgs/autentique-v2?tab=readme-ov-file
 * 
 */
class Autentique
{
    private $token;

    public function __construct()
    {
        $this->token = "94b81014e23b1660c5375be74902f91305b8cdac9aeccd3a7c447a8e1349833c";
    }

    //:ENVIA PDF PARA ASSINATURA ELETRÔNICA
    public function sendPdfForSign($data)
    {
        $autentique = new Documents($this->token);
        $autentique->setSandbox("true");

        if (!file_exists($data['filePath'])) {
            die('Arquivo não encontrado: ' . $data['filePath']);
        }

        $attributes = [
            'document'  => [
                'name'  => $data['documentName'],
            ],
            'signers'   => $data['signers'],
            'file'      => $data['filePath'],
        ];

        return $autentique->create($attributes);
    }

    //:BUSCA URL DO PDF ASSINADO
    public function getUrlPdf($autentiqueId)
    {
        $autentique = new Documents($this->token);
        $autentique->setSandbox("true");

        return $autentique->listById($autentiqueId);
    }
}
