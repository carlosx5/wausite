<?php

namespace App\Controllers;

use App\Controllers\BaseController;

class ViewController extends BaseController
{
    public function initBackend($access = null)
    {
        //:Sistema em manutenção, bloqueia sistema para todos usuários
        $this->checkSystemMaintenance();

        //:Sem session vai p/ controller de login
        if (!parent::checkSession()) $this->doLogin();

        //:Sem permissão, vai p/ controller de usuário sem permissão
        $this->CheckPermission($access);

        //:Se usuário não estiver ativo vai p/ tela de login
        if (!parent::checkStatus())
            $this->doLogin();

        return uri_string();
    }

    //:CHECA SE SISTEMA ESTÁ EM MANUTENÇÃO
    private function checkSystemMaintenance()
    {
        if (!cache()->get('systemMaintenance'))
            return;

        //:O controller de erros terá a funcionalidade de manutenção
        session()->set('errorMode', 'maintenance');

        //:Redireciona p/ controller de erros
        die(header('Location: ' . base_url('mensagem/em-manutencao')));
    }

    //:CHECA SE TEM PERMISSÃO
    public function CheckPermission($access)
    {
        //:Checa acesso
        if (hasPermission($access))
            return true;

        //:O controller de erros terá a funcionalidade de manutenção
        session()->set('errorMode', 'nopermission');

        //:Redireciona p/ controller de erros
        die(header('Location: ' . base_url('mensagem/sem-permissao')));
    }

    //:VAI PARA TELA DE LOGIN
    public function doLogin()
    {
        die(header('Location: ' . base_url('login')));
    }

    /** //:CRIA $DATA P/ CRIAÇÃO DE VIEW
     * @param array|string $css Cria lista de css a serem abertos
     * @param array|string $js Cria lista de js a serem abertos
     * @param string $localhost Nome do armazenamento em memória de localhost
     * @return array
     */
    public function dataCreate($css, $js, $localhost)
    {
        $data['css'] = $this->route('css', $css, $this->refresh);
        $data['js'] = $this->route('js', $js, $this->refresh);
        $data['varJS']['devmodeOn'] = $this->devmodeOn;
        $data['varJS']['localhost'] = $localhost;
        $data['varJS']['refresh'] = $this->refresh;
        $data['varJS']['perm'] = session()->permissions;
        $data['varJS']['theme'] = session()->log_theme;
        $data['theme'] = session()->log_theme;
        $data['refresh'] = $this->refresh;
        $clinicId = padWithZeros(session()->clinic['id']); //:Id da clínica com 11 digitos
        $data['wauSmallLogo'] = base_Url("/dataSistem/images/logos/wau/wau300x117_1.webp?v=$this->refresh");
        $data['clinicLogo'] = base_Url("/data/clinics/$clinicId/logo/logo.png?v=$this->refresh");

        return $data;
    }

    /** //:AUXILIA NA CRIAÇÃO DE ARRAY PARA CSS E JS
     * @param string $extencion
     * @param array|string $data
     * @return array
     */
    public static function route($extencion, $data, $refresh)
    {
        //:PREPARA PARA FORMATO ARRAY
        $arr = strArray($data, null, 'returnAs=1,noSort');

        //:DESCOBRE SE É PC OU CELULAR
        // $width = explode('x', $_COOKIE['screenSize'])[0];
        $device = 'Pc'; // $width > 768 ? 'Pc' : 'Cel';

        //:GLOBAL PARA PC E CELULAR
        $result[] = "assets/$extencion/global/global.$extencion?r=$refresh";
        if ($extencion == 'css') { //:Tema
            $theme = 'theme' . ucfirst(session()->log_theme);
            $result[] = "assets/css/global/$theme.css?r=$refresh";
        }
        if ($device == 'Pc') { //:PC
            $result[] = "assets/$extencion/global/global_pc.$extencion?r=$refresh";
        } elseif ($device == 'Cel') { //:Celular
            $result[] = "assets/$extencion/global/global_cel.$extencion?r=$refresh";
        }

        //:DEMAIS ARQUIVOS CSS/JS
        foreach ($arr as $key => $val) {
            if (strpos($val, '-')) {
                $y = explode('-', $val);

                if ($y[0] == 'p') { //:Plugins
                    $result[] = "plugins/$extencion/$y[1].$extencion";
                } elseif ($y[0] == 't') { //:Tools
                    $result[] = "assets/$extencion/tools/$y[1].$extencion?r=$refresh";
                }
            } else {
                $result[] = "assets/$extencion/$val.$extencion?r=$refresh";
            }
        }

        //:DEV P/ PROGRAMADOR
        if (isset($_SESSION['log_master'])) {
            if (isDev() && $extencion == 'js') {
                array_push($result, "assets/js/tools/dev.js?r=$refresh");
            }
        }

        return $result;
    }
}
