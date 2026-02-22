<?php

namespace App\Controllers\Help\Help;

//LIBERA ACESSOS VINDOS DE URLS EXTERNAS
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Content-Type");

use CodeIgniter\Controller; //SEM USAR BASECONTROLLER
use App\Controllers\RestController; //PARA FUNCIONAR o "$teste1"
use App\Controllers\BaseController;

class _Help extends BaseController
{
    public function __construct()
    {
        parent::__construct();
        $this->modService = new ServiceRegister_Model();
    }

    public function get_data()
    {
        helper('validate');
        validate("082.151.418-03", 'cpf', 'null,true,false,cel,len=5');


        if (!empty($data->birthday)) {
            //:Existe data de nascimento
        }

        $data = new \stdClass(); //:criado p/ não mostrar erros nas linhas abaixo
        if (!empty($data->birthday)) { //:"birthday" existe e tem dados
            $data->birthday = date('Y-m-d', strtotime(str_replace("/", "-", $data->birthday)));
        } elseif (isset($data->birthday)) { //:"birthday" existe mas está vazio
            $data->birthday = null;
        }

        //https://mateussouzaweb.com/blog/php/como-converter-arrays-em-objetos-e-vice-versa-usando-uma-linha-de-codigo
        $data = (object) $this->request->getGetPost();

        $idTeste = $this->request->getVar('idTeste');

        //:Evita erro se a resposta for null
        $resp = ($userRecord = $this->modUserStatus->find(session()->log_userId))
            ? $userRecord->status
            : false;

        return $this->json(200, $data);
    }

    public function send_text()
    {
        //BUSCA HELPER
        helper('global');
        helper(['validate', 'global', 'defaultPermissions']);

        //BUSCA RESULTADO DE UMA FUNCTION EM UMA CLASSE SEM DAR "new"
        // $teste1 = RestController::checkToken();
        // $clinicId = \App\Libraries\Models\WauModel::saveWau("aki vai oq quer salvar");

        //BUSCA LIBRARY #1
        $login = new \App\Models\Login\Login_Model();
        $login->doLogout();
    }

    public function data()
    {
        date_default_timezone_set('America/Sao_Paulo');

        $result = date('Y-m-d');
        $result = date('Y-m-d H:i:s');
        $result = date('Y-m-d H:i:s', strtotime('+1 week'));
        $result = date('Y-m-d H:i:s', strtotime('+1 month'));
        $result = date('Y-m-d H:i:s', strtotime('+1 day', strtotime('2023-08-20')));
        $result = date('d/m/Y', strtotime('2023-08-20'));
        $timestamp = strtotime(date('Y-m-d H:i:s'));
        die(json_encode($result));

        //COMO AJUSTAR O HORARIO DO MYSQL
        //1 – Verifique o Fuso horário atual do servidor
        //SELECT NOW();
        //2 – Altere o Fuso horário pelo PHPMyAdmin
        //SET @@global.time_zone = '-03:00';
        //SET @@global.time_zone = '+00:00'; ASSIM FICA IGUAL AO HOSTIGER
        //
        //https://host2b.net/como-alterar-o-fuso-horario-do-banco-de-dados/
    }

    public function session()
    {
        session()->set(['TESTE' => "Teste ok!"]); //SALVA ARRAY EM SESSÃO
        session()->set('TESTE', "Teste ok!"); //SALVA EM SESSÃO
        session()->get(); //MOSTRA TODA SESSÃO
    }

    public function valoresNumericos()
    {
        $res = (float) '12345.678xxx'; // resp = 12345.678
        $res = (int) '1500.999'; // resp = 1500
    }

    public function salva_em_arquivo()
    {
        //*SALVA NO FORMATO TXT
        $data = "faasd sdfsadf sdfsd asdfasd asdfa";
        $data .= "\n---FIM---\n\n"; //-COLOCAR NO FINAL P/ DAR ESPAÇAMENTO

        $fp = fopen($_SERVER['DOCUMENT_ROOT'] . "/Teste.txt", "a+");
        echo fwrite($fp, $data);
        fclose($fp);
        dj('FIM PARA TEXTO');


        //*SALVA NO FORMATO PDF
        $data = [
            'texto1' => 1,
            'texto2' => 2,
            'texto3' => 3,
        ];

        $fp = fopen($_SERVER['DOCUMENT_ROOT'] . "/Teste.json", "a+");
        fwrite($fp, json_encode($data));
        fclose($fp);
        dj('FIM PARA JSON');


        //.https://www.w3schools.com/php/func_filesystem_fwrite.asp
    }

    public function array()
    {
        //*array_filter, array_map, array_reduce
        //*https://medium.com/@brenodouglas/conhecendo-um-pouco-das-fun%C3%A7%C3%B5es-de-array-filter-map-e-reduce-com-php-cd02f6d51857

        //:Cria um objeto vazio 
        $data = new \stdClass();

        //:REMOVE VALORES VAZIOS
        $w = [1, 2, 3,,, 5];
        $result = array_filter($w);

        //:REMOVE VALORES REPETIDOS
        $w = [1, 2, 3, 1, 2, 5];
        $result = array_unique($w);

        //:ORDENA ARRAY
        $w = [1, 2, 3, 1, 2, 5];
        sort($w);

        //:VERIFICA SE EXISTE NA ARRAY
        dj(in_array('3', [1, 2, 3, 4, 5]));

        //:ORDENA ARRAY POR NOME
        $arr = [
            ['id' => 1, 'nome' => 'Carlos', 'conta' => 40],
            ['id' => 2, 'nome' => 'Zé', 'conta' => 20],
            ['id' => 3, 'nome' => 'Marcelo', 'conta' => 30],
            ['id' => 4, 'nome' => 'Paulo', 'conta' => 10],
        ];
        usort($arr, function ($a, $b): int {
            return $a['nome'] <=> $b['nome'];
        });
        dj($arr);

        //:RETORNA OS VALORES DUPLICADOS
        $arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        $arr2 = [3, 5, 7, 8, 9];
        $result = getDuplicateValuesInArray($arr1, $arr2);
        dj($result);

        //:REMOVE OS VALORES DUPLICADOS DA ARRAY PRINCIPAL "$arr1"
        foreach ($result as $val) {
            $key = array_search($val, $arr1);
            if ($key !== false)
                unset($array1[$key]);
        }

        //*PROCURA O NOME "Carlos" NA ARRAY
        $data['list']['names'] = ["Carlos", "Pedro", "Marcos"];
        $index = array_search('Carlos', $data->list->names);

        //*REMOVE VALOR REPETIDO DENTRO DA ARRAY
        $result = array("a" => "red", "b" => "green", "c" => "red");
        print_r(array_unique($result));

        //*FILTRA ARRAY
        $produtos = [
            ['id' => 1, 'nome' => 'Produto 01', 'valor_unitario' => 100],
            ['id' => 2, 'nome' => 'Produto 02', 'valor_unitario' => 149],
            ['id' => 3, 'nome' => 'Produto 03', 'valor_unitario' => 151]
        ];
        $produtosFiltrados = array_filter($produtos, function ($produto) {
            return $produto['valor_unitario'] > 150;
        });
        json_encode($produtosFiltrados);

        //*APLICA UMA DETERMINADA FUNÇÃO NO ARRAY
        $meuArray = [
            'nome' => ' Carlos Vieira  ',
            'mensagem' => '   Esse exemplo remove os espaços inúteis ',
            'teste' => ' ',
        ];
        $result = array_map('trim', $meuArray);
        json_encode($result);

        //*VERIFICA SE TEM VALOR VAZIO
        json_encode(in_array('', $result) ? 'tem vazio' : 'não tem vazio');

        //*PASSA ARRAY P/ VARIÁVEIS
        $arr = [
            'nome' => 'Carlos',
            'bairro' => 'Pinheiros',
            'cidade' => 'Taboão',
        ];
        extract($arr);
        dj($nome);
    }

    public function str()
    {
        //:BUSCA DE 4 EM DIANTE
        dj(strstr('123456', '4')); //:456

        //:BUSCA ATÉ UM ANTES DO 4
        dj(strstr('123456', '4', true)); //:123
    }

    public function jsonx()
    {
        $newViews = json_decode(json_encode($this->request->getVar('views')), true);
    }

    public function outros()
    {
        //:DIRETÓRIO ATUAL + SEPARADOR
        dj(__DIR__ . DIRECTORY_SEPARATOR);

        header('Location: ' . base_url('no_permission'));
        return redirect()->to(base_url('prontuarios'));

        $resp = str_contains('abcdrf', 'c'); //:$resp = true (segnifica que existe "c" na string)
        $resp = strpos('abcdrf', 'c') !== false; //$resp = true (segnifica que existe "c" na string)
        $resp = strpos('abcdrf', 'a'); //$resp = 0 QUE É DIFERENTE DE "false"
        $resp = strstr('abcdrf', 'c'); //$resp = cdrf | PEGA DO "c" EM DIANTE
        $resp = strstr('abcdrf', 'c', true); //$resp = ab | PEGA ATÉ O "c"
        $resp = strlen('abcdrf'); //$resp = 6
        $resp = substr('abcdef', 0, 3); //$resp = 'abc'
        $resp = 'arquivo_' . uniqid() . '.jpg'; //:Nome do arquivo unico
        $resp = str_pad('1', 11, "0", STR_PAD_LEFT); //:$resp="00000000001"

        $trocaAporB = str_replace('A', 'B', 'ABCDE');
        $removePontos = str_replace(array('.', ',', '/'), ' ', 'esta.frase,tem/ponto,virgura,etc...');
        $removeTodosEspacosDuplicados = preg_replace('/( ){2,}/', '$1', 'aki   existe    espaços duplicados');
        $removeTodasVirgulasDuplicadas = preg_replace('/(,){2,}/', '$1', 'aki,,, existe,, virgulas duplicados');
        //https://pt.stackoverflow.com/questions/81870/qual-express%C3%A3o-regular-posso-utilizar-para-remover-espa%C3%A7os-duplos-em-javascript

        $geradorDeKey = substr(str_shuffle('abcdefghjklmopqrstwvxyzABCDEFGHJKLMNOPQRTUWVXYZ013456789'), 0, 20);

        list($user, $pass, $uid, $gid, $gecos, $home, $shell) = explode(":", "1:2:3:4:5:6");
        echo $user; // 1
        echo $pass; // 2
        echo $uid; // 3

        //-VERIFICA SE MÉTODO EXISTE
        //-$this = essa classe
        if (method_exists($this, "nomeDoMetodo")) {
            dj('Método existe');
        }

        //. PHP/CODEIGNITER
        //. echo uniqid()
        //. if ($this->request->getMethod() == 'get')
        //. header('Location: https://www.cardwau.com/');
        //. return redirect()->to("/");
        //. $value = (int) $total;
        //. $value = (float) $total;
    }
}
