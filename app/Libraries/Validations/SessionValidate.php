<?php

namespace App\Libraries\Validations;

class SessionValidate
{
    /** //:COMPARA "TABELA" E "ID" PARA VER SE JÁ FORAM CHECADOS ANTERIORMENTE
     * @param string $table
     * @param mixed $id
     */
    public static function check($table, $id): bool
    {
        //:Id é inferior a 1 -> retorna false
        if (intval($id) < 1)
            return false;

        //:Parametro "table" não existe em session -> retorna "false"
        if (empty(session()->get()['currentRecordValidationParams']['table']))
            return false;

        //:Parametro contido em "$idParamName" não existe em session -> retorna "false"
        $idParamName = $table . 'Id'; //:Nome do parâmetro de id baseado na tabela
        if (empty(session()->get()['currentRecordValidationParams'][$idParamName]))
            return false;

        //:Passa valores da session p/ variaveis
        $sessTable = session()->get()['currentRecordValidationParams']['table'];
        $sessId = session()->get()['currentRecordValidationParams'][$idParamName];

        //:Table não bate -> retorna "false"
        if ($sessTable !== $table)
            return false;

        //:Id não bate -> retorna "false"
        if ($sessId !== $id)
            return false;

        //:Verificação ok -> retorna "true"
        return true;
    }

    //:RETORNA DADOS DA SESSION PARA MANIPULAÇÃO DE DADOS
    public static function get(): object
    {
        return (object) session()->get()['currentRecordValidationParams'];
    }

    /** //:SETA DADOS PARA VALIDAÇÃO DE TABELA
     * @param array $params obrigatório: ['table'=>?????, 'id'=>?????]
     */
    public static function set($params = null)
    {
        //:Parametro não possui "table" -> retorna "false"
        if (empty($params['table']))
            dieJson(400, 'Paremetro obrigatório #43144');

        //:Parametro não possui "id" -> retorna "false"
        if (empty($params['table'] . 'Id'))
            dieJson(400, 'Paremetro obrigatório #43145');

        session()->set(
            'currentRecordValidationParams',
            $params
        );
    }
}
