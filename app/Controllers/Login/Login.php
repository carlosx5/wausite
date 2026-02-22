<?php

namespace App\Controllers\Login;

use App\Controllers\UnloggedController;
use App\Models\Login\Login_Model;
use App\Models\User\Register\UserRegister_Model;
use CodeIgniter\I18n\Time;

class Login extends UnloggedController
{
    private $login;
    private $modUser;

    public function __construct()
    {
        $this->login = new Login_Model();
        $this->modUser = new UserRegister_Model();
    }

    public function index()
    {
        $data = [];
        $data['clinicLogo'] = base_Url("/dataSistem/images/logos/wau/wau300x117_2.webp");
        $data['logoLab'] = base_Url('/img/logo_01.webp');
        $data['refresh'] = uniqid();
        $data['year'] = date('Y');

        //:Imagem
        // $imageName = $data['theme'] . '01.webp';
        $refresh = $data['refresh'];
        // $data['image'] = base_Url("/dataSistem/images/home/$imageName?v=$refresh");
        $data['logo']  = base_Url("/dataSistem/images/logos/wau/wau300x117_2.webp?v=$refresh");
        $data['ia']    = base_Url("/dataSistem/images/logos/ia/logo01.webp?v=$refresh");

        echo view('login/login.html', $data);
    }

    public function doLogin()
    {
        helper('encode');

        $email = $this->request->getVar('email');
        $password = $this->request->getVar('password');

        //:Faz login
        $user = $this->login->doLogin($email, $password);

        //:Se não encontrar usuário -> retorna erro
        if (!$user)
            return $this->json('200', 'Login ou senha incoreta!');

        dieJson(200);
    }

    public function doLogout()
    {
        $this->login->doLogout();

        dieJson(200);
    }

    /**
     * Alterar senha 1- Solicitação e envio de link por email
     * @param string $email
     */
    public function passwordRecover()
    {
        $username = $this->request->getVar('username');
        $email = $this->request->getVar('email');

        //:Busca usuário pelo email
        $user = $this->modUser
            ->select('id, email')
            ->where('email', $email)
            ->first();

        //:Se não encontrar usuário -> retorna erro
        if (!$user)
            die(json_encode('Usuário não existe!'));

        //:Gera key
        $key = substr(str_shuffle('abcdefghjklmopqrstwvxyzABCDEFGHJKLMNOPQRTUWVXYZ013456789'), 0, 20);

        //:Salva key no BD "users_key"
        db_connect()
            ->table('users_key')
            ->insert([
                'id_user' => $user->id,
                'key' => $key,
                'date' => date('Y-m-d H:i:s'),
            ]);

        //:Envia email INÍCIO
        helper('sendEmail');

        if ($username) { //* Não ativo no momento
            $userTpt = "
                Seu nome de usuário é: <b>{$username}</b>
                <br>
                <br>
            ";
        } else {
            $userTpt = "";
        }

        $url = base_url("pass-recover/?key={$key}");

        $to = $user->email;
        $subject = 'WAU Saúde - recuperação de senha';
        $message = "
            Não responda esse email! Ele é gerado automaticamente.
            <br>
            <br>
            {$userTpt}
            Clique no link abaixo para alterar sua senha.
            <br>
            <br>
            $url
        ";

        $resp = sendEmail($to, $subject, $message);
        //:Envia email FIM

        // return $this->json(200, $resp);
        dieJson(200, $resp);
    }

    public function passwordRecoverView()
    {
        //:Remove todos os cookies
        $this->login->removeAllCookies(true);

        //:Seta "sessionExpiration" para não bugar o JS
        helper('cookie');
        $this->login->sessionExpiration();

        $key = $this->request->getGet('key');

        //BUSCA KEY
        $userKey = db_connect()
            ->table('users_key uk')
            ->select('uk.id, uk.id_user, uk.date, u.email')
            ->where('key', $key)
            ->join('user u', 'u.id = uk.id_user')
            ->get()
            ->getRow();

        $data = $this->dataCreate(
            'login/passwordRecoverView',
            'login/passwordRecoverView',
            ''
        );
        $data['year'] = date('Y');
        $data['logoLab'] = base_Url('/img/logo_01.webp');

        $data['message'] = '';
        if (!$userKey) {
            //VERIFICA SE KEY EXISTE
            $data['message'] = 'Código inválido!';
        } else {
            //VERIFICA SE O TEMPO EXPIROU
            $now = new Time('now');
            $now = $now->toDateTimeString();
            $expireKey = new Time($userKey->date);
            $expireKey = $expireKey->addHours(1)->toDateTimeString();
            if ($now > $expireKey) {
                $data['message'] = 'Código expirou!';
            }
        }

        return viewShow('login/passwordRecoverView', $data, false, false);
    }

    public function passwordRecoverSave()
    {
        helper('encode');

        $key = $this->request->getVar('key');
        $userPass = $this->request->getVar('password');

        //BUSCA KEY
        $userKey = db_connect()
            ->table('users_key uk')
            ->select('uk.id, uk.id_user, uk.date, u.email')
            ->where('key', $key)
            ->join('user u', 'u.id = uk.id_user')
            ->get()
            ->getRow();

        //SE NÃO ACHOU KEY OU USER
        if (!$userKey) {
            dieJson(400, 'Esse link expirou ou não é válido!');
        }

        //MUDA SENHA
        $userPass = password_encode($userPass);
        db_connect()
            ->table('user')
            ->where('id', $userKey->id_user)
            ->update(['password' => $userPass]);

        //DELETA KEY
        db_connect()
            ->table('users_key')
            ->where('key', $key)
            ->delete();

        dieJson(200, 'Senha alterada com sucesso!');
    }
}
