<?php

namespace App\Models\Login;

use CodeIgniter\Model;
use App\Models\User\UserStatus_Model;
use App\Models\User\UserActivity_Model;

class Login_Model extends Model
{
    protected $table = 'user';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
    protected $modStatus;
    protected $modActivity;


    public function doLogin($email, $password, $token = false)
    {
        helper('encode');

        $isCel = (int) (explode('x', $_COOKIE['screenSize'])[0]) <= 768 ? true : false;
        $tokenField = $isCel ? 'token_cel' : 'token';

        //:Login via senha ou via token
        if ($token) {
            $w1 = "user.{$tokenField}";
            $w2 = $token;
        } else {
            $w1 = 'user.email';
            $w2 = $email;
        }

        if (empty($email))
            dieJson(400, 'WAU-0164');

        if (empty($password))
            dieJson(400, 'WAU-0165');

        $dataLogin = $this
            ->select('
                user.id,
                user.name_social as nm_user,
                user.password,
                user.permissions,
                user.activity,
                user.activityPermOn,
                user.adm_master,
                user.token,
                user.token_cel,
                user.id_clinicLog as clinicId,
                user.bankAccess,
                user.theme,
                us.status as userStatus,
                cl.id_clinicMain as clinicMainId,
                cl.name_social as nm_clinic,
                cl.procedureClinicMasterActive,
                cl.status as clinic_status
            ')
            ->where($w1, $w2)
            ->join('user__status us', 'us.id = user.id', 'LEFT')
            ->join('clinic cl', 'cl.id = user.id_clinicLog', 'LEFT')
            ->first();

        //:Usuário não existe -> return 0
        if (!$dataLogin)
            return 0;

        //:Clínica não existe ou está inativa -> retorna erro
        if ($dataLogin->clinic_status != 1)
            dieJson(400, 'Clínica inativa');

        //:Checa senha
        if ($token && $token == $dataLogin->tokenField) {
            //:Fez login via token
        } elseif (password_decode($dataLogin->password) != $password) {
            return 0;
        }

        //:Checa status e atualiza refresh
        $userStatus = $this->userStatus($dataLogin->id);
        if (!$userStatus)
            return 0;

        $this->ressetLogin($dataLogin, $tokenField);

        return $dataLogin;
    }

    public function ressetLogin($dataLogin, $tokenField)
    {
        //:Token
        helper(['token', 'cookie']);
        $token = token(30);
        $this->protect(false)->update($dataLogin->id, [$tokenField => $token]);
        setCook('token', $token);
        session()->set('token', $token);

        //:Permissões
        $permission = $dataLogin->permissions;
        ///
        //:Busca permissões por atividade se estiver ativado
        if ($dataLogin->activityPermOn == 1 && !empty($dataLogin->activity)) {
            //:Passa p/ array
            $activityIds = strArray($dataLogin->activity, '', 'returnAs=1');

            $modActivity = new UserActivity_Model();
            $resp = $modActivity
                ->select('id, permissions')
                ->whereIn('id', $activityIds)
                ->find();

            //:Junta as permissões de todas as atividades
            $list = '';
            foreach ($resp as $r) {
                $list .= $r->permissions;
            }

            $permission .= $list;
        }
        ///
        //:Retorna no formato de stringArray
        $permission = strArray($permission, '');
        ///
        session()->set('permissions', $permission);

        //:login
        setCook('log_userId', $dataLogin->id);
        session()->set('log_userId', $dataLogin->id);
        ///
        setCook('log_userName', $dataLogin->nm_user);
        session()->set('log_userName', $dataLogin->nm_user);
        ///
        $this->sessionExpiration();
        ///
        $dev = $dataLogin->id == 1 ? 1 : 0;
        setCook('log_dev', $dev);
        session()->set('log_dev', $dev);

        //:Tema
        $colors = ['azul', 'rosa', 'verde', 'vinho'];
        if (in_array($dataLogin->theme, $colors)) {
            session()->set('log_theme', $dataLogin->theme);
        } else {
            session()->set('log_theme', 'verde');
        }

        //PROGRAMADOR
        session()->set('log_master', $dataLogin->adm_master);

        //LISTA DE ACESSO A BANCOS
        session()->set(['log' => ['bankAccess' => $dataLogin->bankAccess]]);

        //CLINICA
        setCook('log_clinicId', $dataLogin->clinicId);
        setCook('log_clinicName', $dataLogin->nm_clinic);
        session()->set([
            'clinic' => [
                'id'                            => $dataLogin->clinicId,
                'idMain'                        => $dataLogin->clinicMainId,
                'nameSocial'                    => $dataLogin->nm_clinic,
                'procedureClinicMasterActive'   => $dataLogin->procedureClinicMasterActive,
            ],
        ]);
    }

    public function userStatus($user_id)
    {
        //BUSCA STATUS
        $this->modStatus = new UserStatus_Model();
        $userStatus = $this->modStatus->find($user_id);

        //CHECA SE USUÁRIO ESTÁ ATIVO
        if ($userStatus->status != 1)
            return false;

        return true;
    }

    //:Cria o horário de expiração da sessão
    public function sessionExpiration()
    {
        //:Pega o tempo de expiração configurado (ex: 7200)
        $expirationSeconds = config('Session')->expiration;

        //:Se for 0, a sessão não tem um horário fixo (expira ao fechar o browser)
        if ($expirationSeconds === 0)
            dj("A sessão expira ao fechar o navegador.");

        //:Calcula o horário (Time atual + segundos - 1 minuto)
        $expirationTimestamp = time() + $expirationSeconds - 600;

        //:Formata para leitura humana
        $formattedTime = date('Y-m-d H:i:s', $expirationTimestamp);

        setCook('sessionExpiration', $formattedTime);
        session()->set('sessionExpiration', $formattedTime);
    }

    public function doLogout()
    {
        $this->removeAllCookies();
        session()->destroy();
    }

    public function removeAllCookies($removeAll = false)
    {
        if (isset($_SERVER['HTTP_COOKIE'])) {
            $cookies = explode(';', $_SERVER['HTTP_COOKIE']);

            if ($removeAll) {
                $dontRemove = ['csrf_cookie_name'];
            } else {
                $dontRemove = [
                    'log_email',
                    'log_password',
                    'ci_session',
                    'csrf_cookie_name',
                ];
            }

            foreach ($cookies as $cookie) {
                $parts = explode('=', $cookie);
                $name = trim($parts[0]);

                if (!in_array($name, $dontRemove)) {
                    setcookie($name, '', time() - 1000);
                    setcookie($name, '', time() - 1000, '/');
                }
            }
        }
    }
}
