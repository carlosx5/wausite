<?php

namespace App\Controllers\Dev;

use App\Controllers\FetchController;

class DevEnvironment extends FetchController
{
    public function getEnvironment()
    {
        //:Verifica permissões (mesma lógica do DevDevmode)
        $permis = session()->debugger == 1 ? '999P' : '9P';
        parent::initFetch($permis, false);

        $envFile = ROOTPATH . '.env';
        if (!file_exists($envFile)) {
            dieJson(404, 'Arquivo .env não encontrado');
        }

        $content = file_get_contents($envFile);
        preg_match('/^CI_ENVIRONMENT\s*=\s*(\w+)/m', $content, $matches);
        $currentEnv = $matches[1] ?? 'unknown';

        dieJson(200, ['environment' => $currentEnv]);
    }

    public function setEnvironment()
    {
        //:Verifica permissões
        $permis = session()->debugger == 1 ? '999P' : '9P';
        parent::initFetch($permis, false);

        $newEnv = $this->request->getVar('env');

        if (!in_array($newEnv, ['development', 'production'])) {
            dieJson(400, 'Ambiente inválido. Use "development" ou "production".');
        }

        $envFile = ROOTPATH . '.env';
        if (!file_exists($envFile)) {
            dieJson(404, 'Arquivo .env não encontrado');
        }

        $content = file_get_contents($envFile);

        //:Substitui ou adiciona CI_ENVIRONMENT (apenas linha ativa, ignorando comentários)
        if (preg_match('/^CI_ENVIRONMENT\s*=\s*\w+/m', $content)) {
            $newContent = preg_replace('/^CI_ENVIRONMENT\s*=\s*\w+/m', "CI_ENVIRONMENT = $newEnv", $content);
        } else {
            $newContent = $content . "\nCI_ENVIRONMENT = $newEnv";
        }

        if (file_put_contents($envFile, $newContent) === false) {
            dieJson(500, 'Falha ao escrever no arquivo .env');
        }

        dieJson(200, ['success' => true, 'environment' => $newEnv]);
    }
}
