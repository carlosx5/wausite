<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use CodeIgniter\HTTP\CLIRequest;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;
use App\Models\User\UserStatus_Model;

/**
 * Class BaseController
 *
 * BaseController provides a convenient place for loading components
 * and performing functions that are needed by all your controllers.
 * Extend this class in any new controllers:
 *     class Home extends BaseController
 *
 * For security be sure to declare any new methods as protected or private.
 */
abstract class BaseController extends Controller
{
    /**
     * Instance of the main Request object.
     *
     * @var CLIRequest|IncomingRequest
     */
    protected $request;

    /**
     * An array of helpers to be loaded automatically upon
     * class instantiation. These helpers will be available
     * to all other controllers that extend BaseController.
     *
     * @var list<string>
     */
    protected $helpers = [];

    /**
     * Be sure to declare properties for any property fetch you initialized.
     * The creation of dynamic property is deprecated in PHP 8.2.
     */
    // protected $session;

    //:MODO DE PROGRAMAÇÃO ATIVO OU NÃO
    public $devmodeOn;

    //:REFRESH
    public $refresh;

    //:CHECA STATUS DO USUÁRIO
    public $modUserStatus;

    /**
     * @return void
     */
    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        // Do Not Edit This Line
        parent::initController($request, $response, $logger);

        // Preload any models, libraries, etc, here.

        // E.g.: $this->session = service('session');

        date_default_timezone_set('America/Sao_Paulo');

        $this->devmodeOn = $this->checkDevmodeOn();
        $this->refresh = $this->checkRefresh();
        $this->modUserStatus = new UserStatus_Model();
    }

    //:CHECA REFRESH
    private function checkRefresh()
    {
        //:Se estiver com devmodeOn ativo retorna dinamico
        if ($this->devmodeOn)
            return uniqid();

        //:Se não existe cache de refresh, cria por um ano
        if (!cache()->get('refresh'))
            cache()->save('refresh', uniqid(), 86400);

        return cache()->get('refresh');
    }

    //:CHECA DEVMODEON
    private function checkDevmodeOn()
    {
        //:Se tem permissão de DEV retorna valor de devmodeOn, se não tem retorna null
        return hasPermission('9P') ? cache()->get('devmodeOn') : null;
    }

    //:CHECA SE EXISTE SESSÃO
    public function checkSession()
    {
        return session()->log_userId ? true : false;
    }

    //:CHECA STATUS DO USUÁRIO
    public function checkStatus()
    {
        if ($userRecord = $this->modUserStatus->find(session()->log_userId)) {
            //:Se usuário não estiver ativo retorna "false" onde será redirecionado p/ tela de login
            if ($userRecord->status != 1)
                return false;

            //:Se "doLogin=1" retorna "false" onde será redirecionado p/ tela de login
            if ($userRecord->doLogin == 1) {
                //:Antes zera "doLogin" na tabela
                $this->modUserStatus->protect(false)->update(session()->log_userId, ['doLogin' => 0]);
                return false;
            }

            //:Se foi feita alguma alteração na configuração do usuário -> atualiza sessão
            if ($userRecord->refreshLogin == 1) {
                $this->modUserStatus->protect(false)->update(session()->log_userId, ['refreshLogin' => 0]);

                $dataUser = $this->modUserStatus
                    ->select("
                        user.email,
                        user.password,
                    ")
                    ->where('user__status.id', session()->log_userId)
                    ->join('user', 'user.id = user__status.id', 'LEFT')
                    ->first();

                //:Decodifica senha
                helper('encode');
                $dataUser->password = password_decode($dataUser->password);

                //:Loga novamente com os novos dados
                $modLogin = new \App\Models\Login\Login_Model();
                $modLogin->doLogin($dataUser->email, $dataUser->password);
            }
        } else {
            return false;
        }

        return true;
    }
}
