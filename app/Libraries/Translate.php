<?php

namespace App\Libraries;

use Google\Cloud\Translate\V2\TranslateClient;

class Translate
{

    private static function getClient()
    {
        return new TranslateClient([
            'key' => 'AIzaSyDi6x5i9lNDIk37XwHdrEWCj1VOyLGB464',
        ]);
    }

    /**
     * Método responsável por executar a tradução dos textos
     * @param string $input
     * @param array $targetLanguages
     * @return array
     */
    public static function run($input, $targetLanguages = [])
    {
        $obClient = self::getClient();
        echo '<pre>';
        print_r($obClient->translate($input, $targetLanguages));
        echo '</pre>';

        die;

        return $obClient->translate($input, $targetLanguages);
    }
}
