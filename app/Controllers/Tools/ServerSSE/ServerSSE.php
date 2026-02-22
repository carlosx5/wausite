<?php

namespace App\Controllers\Tools\ServerSSE;

use App\Controllers\ViewController;

// header('Content-Type: text/event-stream');
// header('Cache-Control: no-cache');

class ServerSSE extends ViewController
{
    public function index()
    {
        $this->initBackend(999);
        session()->setFlashdata('sidebar', ['viewTitle' => 'Tela Inicial']);

        $data = $this->dataCreate('', 'home/home,Tools/ServerSSE/ServerSSE', 'home');

        $clinicId = padWithZeros(session('clinic')['id']); //:Id da clínica com 11 digitos
        $data['logo'] = base_Url("/data/clinics/$clinicId/logo/logo.png?v=$this->refresh");

        viewShow('home/home*cel', $data);

        $this->stream();
    }

    public function stream()

    {
        $this->response->setHeader('Content-Type', 'text/event-stream');
        $this->response->setHeader('Cache-Control', 'no-cache');
        $this->response->setHeader('Connection', 'keep-alive');
        // while (true) {
        // Exemplo: verifica novos arquivos a cada 2s (sem recarregar tudo)
        // sleep(2);
        $newFiles = $this->checkNewFiles();
        // if ($newFiles) {
        // viewShow('record/recordMain', []);
        echo site_url('sse/stream');
        echo "data: " . json_encode(['filename' => $newFiles]) . "\n\n";
        ob_flush();
        flush();
        // }
        // }
    }

    private function checkNewFiles()
    {
        return 'FUNCIONOU!';
        // Lógica para verificar novos arquivos no servidor
        // Retorna o nome do arquivo se houver novos, ou false caso contrário

        // Exemplo fictício:
        $hasNewFile = rand(0, 5) === 3; // Simula a chance de ter um novo arquivo
        if ($hasNewFile) {
            return 'FUNCIONOU!';
        }
        return false;
    }
}
