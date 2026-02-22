<?php

namespace App\Controllers;

use CodeIgniter\Controller;

class BackgroundRemover extends Controller
{
    public function render()
    {
        $caminhoOriginal = FCPATH . 'uploads/img01.jpg';
        $caminhoDestino  = FCPATH . 'uploads/imagem_sem_fundo.png';

        // 1. Carregamos a biblioteca de imagens do CI4
        $image = \Config\Services::image()
            ->withFile($caminhoOriginal);

        // 2. Para manipulação de transparência por cor, 
        // pegamos o recurso bruto do GD (resource/object)
        /** @var \GdImage $resource */
        $resource = $image->getResource();

        // Pega a cor exata do pixel na posição 0,0 (canto superior esquerdo)
        $corFundo = imagecolorat($resource, 0, 0);
        // dj($corFundo);

        // 3. Definimos a cor para remover (a cor do pixel 0,0)
        // 3. Preparamos para salvar com transparência real (Alpha Channel)
        imagealphablending($resource, false);
        imagesavealpha($resource, true);

        // Cria uma cor totalmente transparente (r,g,b, 127)
        $transparente = imagecolorallocatealpha($resource, 255, 255, 255, 127);

        // 4. Substituição manual pixel-a-pixel (Garante funcionamento em TrueColor)
        $w = imagesx($resource);
        $h = imagesy($resource);

        for ($x = 0; $x < $w; $x++) {
            for ($y = 0; $y < $h; $y++) {
                // Se a cor do pixel for igual à do fundo, substitui por transparente
                if (imagecolorat($resource, $x, $y) === $corFundo) {
                    imagesetpixel($resource, $x, $y, $transparente);
                }
            }
        }

        // 5. Salvamos usando o próprio motor do CI4
        // O formato PNG é forçado pela extensão do arquivo
        if ($image->save($caminhoDestino)) {
            return "Sucesso! Imagem salva em: " . $caminhoDestino;
        } else {
            return "Erro ao processar imagem.";
        }
    }
}
