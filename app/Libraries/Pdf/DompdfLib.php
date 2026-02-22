<?php

namespace App\Libraries\Pdf;

use Dompdf\Dompdf;
use Dompdf\Options;

/**
 * 
 * :Classe para manipulação de PDF usando Dompdf.
 * 
 * :https://github.com/dompdf/dompdf
 * 
 * :Instalado com Composer
 * :composer require dompdf/dompdf
 * 
 */
class DompdfLib
{
    protected $dompdf;

    public function __construct()
    {
        // Configurações opcionais para o Dompdf
        $options = new Options();
        $options->set('isRemoteEnabled', true); // Habilita o carregamento de recursos remotos, como imagens e CSS via URL

        $this->dompdf = new Dompdf($options);
    }

    /**
     * :Gerar PDF a partir de um conteúdo HTML.
     *
     * @param string  $html     Conteúdo HTML para renderizar.
     * @param string  $filename Nome do arquivo PDF gerado.
     * @param string  $output   Tipo de saída ('I' - inline, 'D' - download, 'F' - salvar em arquivo, 'S' - retornar como string)
     * @return void|string
     */
    public function renderPDF(string $html, string $filename = 'documento.pdf', string $output = 'I')
    {
        // Carrega o HTML na instância do Dompdf
        $this->dompdf->loadHtml($html);

        // (Opcional) Definir o tamanho do papel e orientação
        $this->dompdf->setPaper('A4', 'portrait');

        // Renderizar o HTML para PDF
        $this->dompdf->render();
        // dj('ok');

        // Enviar o PDF de acordo com a saída especificada
        switch ($output) {
            case 'D': // Forçar download
                return $this->dompdf->stream($filename, ['Attachment' => true]);
            case 'F': // Salvar em arquivo
                file_put_contents($filename, $this->dompdf->output());
                return $filename;
            case 'S': // Retornar como string
                return $this->dompdf->output();
            case 'I': // Exibir no navegador
            default:
                return $this->dompdf->stream($filename, ['Attachment' => false]);
        }
    }
}
