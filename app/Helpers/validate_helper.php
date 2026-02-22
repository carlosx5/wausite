<?php

/**
 * Método de validação com retorno direto via json
 *
 * @param mixed $check - parametro a ser verificado
 *
 * @param string $msg - mensagem
 *  ''                        = não envia mensagem
 *  'string'                  = preenche template com a string
 *  '*Mensagem personalizada' = mensagem personalizada
 *
 * @param array $arr - array com vários parametros para checagem (avançado)
 */
function validate($check, $msg = '', $opt = false)
{
    $check = is_string($check) ? trim($check) : $check;
    $opt = ',' . $opt . ",";

    if ($check && strpos($opt, 'null')) {//SE NÃO FOR VAZIO
        $data = msgHelp("{$msg}", "Campo \"{$msg}\" duplicado", 460);
    } elseif (!$check && strpos($opt, 'true')) {//SE NÃO FOR VERDADEIRO
        $data = msgHelp("*{$msg}", '', 999);
    } elseif ($check && strpos($opt, 'false')) {//SE NÃO FOR FALSO
        $data = msgHelp("*{$msg}", '', 999);
    } elseif (!$check && $opt == ',,') {//SE FOR VAZIO
        $data = msgHelp($msg, "O campo \"{$msg}\" deve estar preenchido.", 460);
    } elseif (strpos($opt, 'cel')) {//SE CELULAR INCORRETO
        if (strlen($check) != 13) {
            $data = msgHelp($msg, "O campo \"{$msg}\" deve estar preenchido corretamente.", 460);
        }
    } elseif (strpos($opt, 'len')) {//SE TAMANHO INCORRETO
        $len = strArrayFind($opt, 'len');
        if (strlen($check) < $len) {
            $data = msgHelp($msg, "O campo \"{$msg}\" deve ter {$len} caracteres.", 460);
        }
    }

    // RETORNA COM ERRO
    if (isset($data['status'])) {
        die(json_encode($data));
    }

    return false;
}

/**
 * Ajuda na criação da mensagem
 */
function msgHelp($msg, $template, $status)
{
    if (!$msg || $msg == '*') {
        return ['status' => $status];
    } elseif (strpos($msg, '*') !== false) {
        return ['status' => $status, 'msg' => str_replace(array('*'), '', $msg)];
    }
    ;

    return ['status' => $status, 'msg' => $template];
}
