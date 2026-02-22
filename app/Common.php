<?php

function isDev()
{
    return (session()->log_master == 1 || session()->debugger == 1) ? 1 : 0;
}

/**
 * Método para checar se houve alteração na tabela
 */
function check_updated_at($table, $primaryKey, $find)
{
    $updated_at = db_connect()->table($table)->where($primaryKey, $find)->get()->getRow()->updated_at;
    $updated_at_session = session()->get('updated_at');

    if ($updated_at != $updated_at_session) {
        echo json_encode(['status' => 101, 'msg' => 'Essa tela foi atualizada antes do você salvar!']);
        return 0;
    }

    return 1;
}

//:CONVERTE VALOR NUMÉRICO PARA FORMATO BANCO DE DADOS
function numberConvertDb($val)
{
    $val = preg_replace('/[^\d,]/', '', $val);
    return str_replace(',', '.', $val);
}

/** //-ADICIONA UM NOVO VALOR NA ARRAY|STRING E RETORNA EM VÁRIOS FORMATOS
 * @param mixed $y valor principal
 * @param mixed $x valor a ser adicionado | se não tiver valor o método irá apenas organizar "y"
 * @param string $more "spliter=;,remove,repeat,noSort,returnAs=1|2|3"
 * @return mixed
 */
function strArray($y = [], $x = [], $more = null)
{
    $spliter = ','; //:SEPARADOR
    $remove = null; //:REMOVE OU ADICIONA
    $repeat = null; //:REPETE VALORES
    $noSort = null; //:NÃO ORDENA
    $returnAs = 3; //:1-ARRAY | 2-STRING SEM VIRGULAS | 3-STRING COM VIRGULAS

    //:SE VIER ALGUMA REGRA FORA DO PADRÃO
    if ($more) {
        $spliter = strArrayFind($more, 'spliter') ?? ',';
        $remove = strArrayFind($more, 'remove', true);
        $repeat = strArrayFind($more, 'repeat', true);
        $noSort = strArrayFind($more, 'noSort', true);
        $returnAs = strArrayFind($more, 'returnAs') ?? 3;
    }

    //:CRIA "w" EM FORMATO ARRAY
    $w = is_array($y) ? $y : explode($spliter, $y);

    //:CRIA "w" EM FORMATO ARRAY
    $k = is_array($x) ? $x : explode($spliter, $x);

    //:REMOVE VALORES VAZIOS
    $w = array_filter($w);
    $k = array_filter($k);

    //:ADICIONA OU REMOVE K EM W
    $w = array_merge($w, $k); //!SÓ ADICINANDO NO MOMENTO

    //:SE FOR P/ REMOVE VALORES REPETIDOS
    if (!$repeat)
        $w = array_unique($w);

    //:ORDENA ARRAY
    if (!$noSort)
        sort($w);

    //:RETORNA COMO ARRAY
    if ($returnAs == 1)
        return $w;

    //:RETORNA COMO STRING SEM VIRGULA NO INICIO E FIM
    if ($returnAs == 2)
        return join($spliter, $w);

    //:RETORNA COMO STRING COM VIRGULA NO INICIO E FIM
    if ($returnAs == 3) {
        $w = $spliter . join($spliter, $w) . $spliter;
        return $w == $spliter . $spliter ? '' : $w;
    }

    return $y;
}

/** //-VERIFICA SE EXISTE X EM Y
 * @param mixed $y string principal
 * @param string $x string a ser comparada
 * @return bool
 */
function strArrayExist($y, $x, $all = null)
{
    $y = strArray($y, false, 'returnAs=1');
    $x = strArray($x, false, 'returnAs=1');

    //:VERIFICA SE CONTEM ALGUM "$x" EM "$y"
    if (!$all) {
        foreach ($x as $compare) {
            if (in_array($compare, $y))
                return true;
        }
    }

    //:VERIFICA SE TODOS "$x" EXISTEM EM "$y"
    if ($all) {
        return false; //!AINDA NÃO ESTÁ FUNCIONANDO
    }

    return false;
}

/** //-BUSCA VALOR EM UMA stringArray
 * @param string $str stringArray
 * @param string $find key a ser localizada
 * @param bool $checkIfIsEmpty se "true" e "$find" for encontrado mas sem nenhum valor retorna true
 * @return bool|string|null retorna valar de "$find"
 */
function strArrayFind($str, $find, $checkIfIsEmpty = null)
{
    $explode = explode(',', $str);
    $explode = array_filter($explode);
    $explode = array_unique($explode);

    foreach ($explode as $key => $v) {
        //:SE $find É ENCONTRADO MAS SEM VALOR
        if ($checkIfIsEmpty && $v == $find)
            return true;

        //:SE $find É ENCONTRADO COM VALOR RETORNA O VALOR
        if (strpos($v, "$find=") !== false)
            return str_replace("$find=", '', $v);
    }

    //:SE $find NÃO FOR LOCALIZADO
    return null;
}

/** //-FORÇA O RETORNO DE "null" EM EXPRESSÕES null | false | 0 | "0"
 * @param mixed $data valor a ser processado
 * @param mixed $responseOption resposta imposta caso $data não seja válido
 * @param bool $zeroReturn aceita "0" como resposta válida
 * @return mixed
 */
function result($data, $responseOption = null, $zeroReturn = null)
{
    //:SE $zeroReturn FOR false, IGNORA "0" COMO RESPOSTA VÁLIDA
    if (!$zeroReturn && ($data === 0 || $data === "0"))
        return $responseOption;

    //:SE $zeroReturn FOR true, ACEITA "0" COMO RESPOSTA VÁLIDA
    if ($zeroReturn && ($data === 0 || $data === "0"))
        return $data;

    //:SE $data FOR null
    if ($data == null)
        return $responseOption;

    //:SE $data FOR false
    if ($data == false)
        return $responseOption;

    return $data;
}

/** //-REMOVE ACENTUAÇÃO E CARACTERES ESPECIAIS
 * @param mixed $data
 * @param string $more "espaco"
 * @return string
 */
function removeSpecialChars($data, $more = null)
{
    //:SE VIER ALGUMA REGRA FORA DO PADRÃO
    if ($more)
        $spaces = strArrayFind($more, 'espaco', true) ?? null;

    //:REMOVE CARACTERES ESPECIAIS
    $data = iconv('UTF-8', 'ASCII//TRANSLIT', $data);

    //:SUBSTITUI CARACTERES COM ACENTUAÇÃO
    $data = preg_replace("/[^a-zA-Z0-9\s]/", "", $data);

    //:REMOVE ESPAÇO|TAB|QUEBRA DE LINHA|ETC...
    if (isset($spaces))
        $data = preg_replace('/\s+/', '', $data);

    return $data;
}

/** //:RETORNA STRING COM UM TOTAL DE CARACTERES A FRENTE
 * @param string|int $str Variavel a ser alerada
 * @param int $totalLength Quantidade total de caracteres
 * @param string $padChar Caracter p/ preenchimento na frente
 * @return string
 */
function padWithZeros($str, $totalLength = 11, $padChar = "0")
{
    return str_pad($str, $totalLength, $padChar, STR_PAD_LEFT);
}

/** //:VERIFICA SE PERMISSÃO ENVIADA EXISTE EM SESSION
 * @param mixed $permission
 * @return string|null
 */
function hasPermission($permission): string|null
{
    if (!is_array($permission))
        $permission = explode(',', $permission);

    foreach ($permission as $p) {
        $p = ',' . str_replace("P", "", $p) . ',';

        if (str_contains(session()->get('permissions'), $p)) {
            return $p;
        }

        if ($p == ',999,') return $p;
    }

    return null;
}

//:BUSCA COOKIE
function getCook($name)
{
    return isset($_COOKIE[$name]) ? $_COOKIE[$name] : 0;
}

/** //-CRIA VIEW */
function viewShow($home, $data, $parser = false, $showSidebar = true)
{
    $isCel = false; //* intval(explode('x', $_COOKIE['screenSize'])[0]) < 768 ? true : false;
    $sidebar = $isCel ? 'sidebar_cel.html' : 'sidebar_v.php';
    $home .= ($isCel && strpos($home, '*cel')) ? "_cel" : '';
    $home = str_replace('*cel', '', $home);

    //:HEADER
    echo view('templates/header_v', $data);

    //:SIDEBAR
    if ($showSidebar)
        echo view("sidebar/_sidebar/{$sidebar}");

    //:MAIN
    echo "<main>\n";
    if ($parser) {
        echo service('parser')->setData($data)->render("{$home}.html");
    } else {
        echo view("{$home}.html");
    }
    echo "</main>\n";

    //:FOOTER
    echo view('templates/footer_v');
}

//:RETORNA FETCH EM FORMATO JSON COM DIE
function dieJson($par1 = false, $par2 = false)
{
    if (is_numeric($par1)) {
        if ($par2) {
            if (is_object($par2)) {
                $par2 = (array) $par2;
            }

            if (is_array($par2)) {
                $data = $par2;
            } else {
                $data['msg'] = $par2;
            }

            $data['status'] = $par1;
        } else {
            $data['status'] = $par1;
            $data['parametro-2'] = $par2;
        }
    } else {
        $data['par1'] = $par2;
        $data['par2'] = $par2;
    }

    die(json_encode($data));
}

//:FINALIZA BACKEND EM FORMATO "json_encode"
function dj($data)
{
    die(json_encode(['status' => 899, 'dev' => $data]));
}

//:FINALIZA BACKEND EM FORMATO "print_r"
function dp($data)
{
    echo "<pre>";
    print_r($data);
    die("</pre>");
}

/** //*SALVA TEXTO EM ARQUIVO NO FORMATO JSON
 * @param string|array $data - texto a ser salvo
 * @param string $arq - nome do arquivo a ser salvo
 */
function arquiva($data, $arq)
{
    // $fp = fopen($_SERVER['DOCUMENT_ROOT'] . "/{$arq}.json", "a+");
    $fp = fopen("{$arq}.json", "a+");
    fwrite($fp, json_encode($data));
    fclose($fp);
}

/** //*ADICIONA 1 NO CONTADOR
 * @param string $data - valor a ser alterado
 * @return string
 */
function counter($data = null)
{
    //-SE NÃO VIER VALOR RETORNA "1"
    if (!$data) {
        return '1';
    }

    $cod = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    $dataArray = str_split($data);
    $len = count($dataArray) - 1;

    //-INICIA LOOPING
    while ($len >= 0) {
        $char = $dataArray[$len];

        //-SOMA UM
        if ($char == 'z') { //.MANDA MUDAR A PROXIMA CASA
            $char = '1';
            $add = true;
        } else { //.NÃO EXECUTA AÇÃO P/ PROXIMA CASA
            $char = substr($cod, strpos($cod, $char) + 1, 1);
            $add = false;
        }

        //-ALTERA VALOR
        $dataArray[$len] = $char;

        if ($add) { //.ALTERA OU CRIA PROXIMA CASA DECIMAL
            if ($len == 0) { //.CRIA MAIS UMA CASA DECIMAL
                array_unshift($dataArray, '1');
                break;
            }
            //:SE PASSOU ALTERA A PROXIMA CASA DECIMAL
        } else { //.NÃO ALTERA PROXIMA CASA DECIMAL
            break;
        }

        $len--;
    }

    return implode('', $dataArray);
}
