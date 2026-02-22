<?php

/**
 * Busca um valor na array
 *
 * @param array $array
 *   Array a ser verificada
 *
 * @param mixed $search
 *   Variavel a ser encontrada
 *
 * @param true|false $returnKeyOnly
 *   Retorna apenas a key ou todas as informações
 *
 * @param null|string $keySearsh
 *   null = busca em todas as keys | string = nome da key a ser verificada
 *
 * @param true|false $first
 *   true = para ao encontrar a primeira opção
 *
 * @return array|null
 */
function searchInArray($array, $search, $returnKeyOnly = true, $keySearsh = null, $first = true)
{
    $result = null;

    foreach ($array as $key => $val) {
        if (!$keySearsh) {
            if (in_array($search, $val)) {
                $result = $returnKeyOnly ? $key : $val;
                if ($first) {
                    return $result;
                }
            }
        } else {
            if ($val[$keySearsh] == $search) {
                $result = $returnKeyOnly ? $key : $val;
                if ($first) {
                    return $result;
                }
            }
        }
    }

    return $result;
}
