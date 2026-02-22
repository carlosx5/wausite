<?php

namespace App\Libraries\Image;

class ResizeImage
{
    public function render(string $filePath, int $maxWidth = 600)
    {
        //:Corrige rotação baseada em EXIF e redimensiona imagem para largura máxima
        $info = getimagesize($filePath);

        if ($info === false) {
            return;
        }

        //:Certifica que é jpg ou png
        $mime = $info['mime'];
        $isJpg = $mime === 'image/jpeg';
        $isPng = $mime === 'image/png';

        //:Só JPEG tem EXIF
        if ($isJpg && function_exists('exif_read_data')) {
            $exif = @exif_read_data($filePath);

            if (!empty($exif['Orientation'])) {
                $img = imagecreatefromjpeg($filePath);

                switch ($exif['Orientation']) {
                    case 3:
                        $img = imagerotate($img, 180, 0);
                        break;
                    case 6:
                        $img = imagerotate($img, -90, 0);
                        break;
                    case 8:
                        $img = imagerotate($img, 90, 0);
                        break;
                }

                imagejpeg($img, $filePath, 100);
                imagedestroy($img);
            }
        }

        // Recalcula tamanho APÓS corrigir rotação
        [$width, $height] = getimagesize($filePath);

        if ($width <= $maxWidth) {
            return;
        }

        $newWidth  = $maxWidth;
        $newHeight = \intval(($height * $newWidth) / $width);

        // Cria imagem de origem
        if ($isJpg) {
            $srcImage = imagecreatefromjpeg($filePath);
        } elseif ($isPng) {
            $srcImage = imagecreatefrompng($filePath);
        } else {
            return;
        }

        $dstImage = imagecreatetruecolor($newWidth, $newHeight);

        // Transparência PNG
        if ($isPng) {
            imagealphablending($dstImage, false);
            imagesavealpha($dstImage, true);
        }

        imagecopyresampled(
            $dstImage,
            $srcImage,
            0,
            0,
            0,
            0,
            $newWidth,
            $newHeight,
            $width,
            $height
        );

        if ($isJpg) {
            imagejpeg($dstImage, $filePath, 85);
        } else {
            imagepng($dstImage, $filePath);
        }

        imagedestroy($srcImage);
        imagedestroy($dstImage);
    }
}
