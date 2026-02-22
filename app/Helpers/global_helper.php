<?php

function getDuplicateValuesInArray($array1, $array2)
{
    $result = [];

    foreach ($array2 as $val) {
        $val = strtoupper($val);
        if (in_array($val, $array1)) {
            array_push($result, $val);
        };
    }

    return $result;
}

function permiss($data)
{
    if (!is_array($data)) {
        $data = [$data];
    }

    return getDuplicateValuesInArray(explode(',', getCook('permissions')), $data);
}

/** //-VERIFICA SE EXISTE "$find" DENTRO DE "$subject"
 * @param string $subject string a ser verificada
 * @param string $find string a ser encontrada
 * @return bool
 */
function exists($subject, $find)
{
    return strpos($subject, $find) !== false;
}

/** //-RETORNA DIA DA SEMANA
 * @param string $date formato "2024-10-25"
 * @return array : array com $int(0-6), $string(Domingo-Sábado)
 */
function dateWeek($date)
{
    //:DIA DA SEMANA EM FORMATO INTEIRO
    $weekInt = date('w', strtotime($date));

    //:DIA DA SEMANA EM FORMATO STRING
    $weekString = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][$weekInt];

    return ['int' => $weekInt, 'string' => $weekString];
}
