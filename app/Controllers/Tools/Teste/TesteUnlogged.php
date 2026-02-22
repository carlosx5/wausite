<?php

namespace App\Controllers\Tools\Teste;

use App\Controllers\UnloggedController;

class TesteUnlogged extends UnloggedController
{
    public function __construct()
    {
    }

    public function index()
    {
        $url = file_get_contents('http://localhost/arcapp/public/login');

        $var1 = explode('f_body', $url);
        $var2 = explode('box', $var1[1]);

        // die(json_encode($url));
        print $var2[0];
        die;






        // Inicia o cURL
        $ch = curl_init();

        // Define a URL original (do formulário de login)
        curl_setopt($ch, CURLOPT_URL, 'http://localhost/arcapp/public/login/login.php');

        // Habilita o protocolo POST
        curl_setopt($ch, CURLOPT_POST, 1);

        // Define os parâmetros que serão enviados (usuário e senha por exemplo)
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'log_user=carlito&log_password=arcar@654');

        // Imita o comportamento patrão dos navegadores: manipular cookies
        curl_setopt($ch, CURLOPT_COOKIEJAR, 'cookie.txt');

        // Define o tipo de transferência (Padrão: 1)
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

        // Executa a requisição
        $store = curl_exec($ch);

        // // Define uma nova URL para ser chamada (após o login)
        // curl_setopt($ch, CURLOPT_URL, 'http://localhost/arcapp/public/home');

        // // Executa a segunda requisição
        // $content = curl_exec($ch);

        // Encerra o cURL
        curl_close($ch);

        echo($store);
        // echo json_encode($store);
    }
}
