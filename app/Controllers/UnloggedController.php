<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use App\Controllers\ViewController;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;

class UnloggedController extends Controller
{
    protected $request;

    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        parent::initController($request, $response, $logger);

        define('TOKEN', 'pqFpYbMC4xIQD83klLYO03EFVUs5Sinyy');
    }

    /** //-CRIA $DATA P/ CRIAÇÃO DE VIEW
     * @param array|string $css
     * @param array|string $js
     * @param string $localhost
     * @return array
     */
    public function dataCreate($css, $js, $localhost)
    {
        $refresh = uniqid();

        $data['css'] = ViewController::route('css', $css, $refresh);
        $data['js'] = ViewController::route('js', $js, $refresh);
        $data['varJS']['devmode'] = session()->log_devmode;
        $data['varJS']['localhost'] = $localhost;
        $data['refresh'] = $refresh;
        // $data['screenWidth'] = $this->screenWidth;

        return $data;
    }
}
