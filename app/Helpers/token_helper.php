<?php

/** //:GERA TOKEN
 * @param null|number $tamanho
 * @param null|string $characters
 *
 * @return string
 */
function token($tamanho = 10, $characters = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
{
    $charactersLength = strlen($characters);
    $randomString = '';

    for ($i = 0; $i < $tamanho; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }

    return $randomString;
}
