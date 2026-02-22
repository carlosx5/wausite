<?php

namespace App\Libraries;

class Sidebar
{
    /**
     * Método de criação de <li> no sidebar
     * @param string $txt
     * @param string $icon
     * @param string $link
     * @param string $access
     */
    public function sb($txt, $icon, $link, $access)
    {
        if (!hasPermission($access)) return;

        $urlResp = $this->processAttributes($link);
        $href = $urlResp['href'] ?? '';
        $blank = $urlResp['blank'];
        $js = $urlResp['js'];

        $sel = (isset($_SESSION['sidebar']['menuActive']) && $_SESSION['sidebar']['menuActive'] == trim($txt)) ? ' active' : '';
        $class = $sel ? ' active' : "";

        if ($txt === 'Atendimentos')
            $class .= ' service';

        $tpt = "
            <li class='nav-item'>
                <a $href class='nav-link$class' $blank>
                    <i class='$icon'></i>
                    <span class='menu-text'>$txt</span>
                </a>
            </li>";

        echo $tpt;
    }

    /**
     * Método de criação de <li> no sidebar com submenus
     * @param string $txt
     * @param string $icon
     * @param string $access
     * @param array $data
     */
    public function sbDrop($txt, $icon, $access, $data)
    {
        if (!hasPermission($access))
            return;

        $txtNoSpace = str_replace(' ', '_', $txt);

        $sel = (isset($_SESSION['sidebar']['menuActive']) && $_SESSION['sidebar']['menuActive'] == trim($txt)) ? ' active' : '';
        $class = $sel ? ' active' : "";

        //:Inicio do template
        $tpt = "
            <li class='nav-item'>
                <a href='#$txtNoSpace' class='nav-link$class' data-bs-toggle='collapse' role='button' aria-expanded='false' aria-controls='$txtNoSpace'>
                    <i class='$icon'></i>
                    <span class='menu-text'>$txt</span>
                    <i class='bi bi-chevron-down dropdown-icon'></i>
                </a>
                <div class='collapse' id='$txtNoSpace'>
                    <ul class='nav flex-column submenu'>";
        // <li class='nav-item'><a href='#' class='nav-link'><span class='menu-text'>TESTE</span></a></li>";

        //:Corpo do template
        // dj($data);
        foreach ($data as $dt) {
            if (hasPermission($dt[2])) {
                $urlResp = $this->processAttributes($dt[1]);
                // $class = isset($dt[3]) ? " class='xfast'" : '';
                $class = isset($dt[3]) ? "" : '';
                $href = $urlResp['href'];
                $blank = $urlResp['blank'];
                $js = $urlResp['js'];

                // $tpt .= "<a{$href}{$class}{$blank}{$js}>{$dt[0]}</a>";
                $tpt .= "<li class='nav-item'><a $href class='nav-link'><span class='menu-text'>$dt[0]</span></a></li>";
            }
        }

        //:Fim do template
        $tpt .= "
                    </ul>
                </div>
            </li>";

        echo $tpt;
    }

    /**
     * Método para tratar atributos formatando-os para a tag
     * @param string $link
     * @return array
     */
    private function processAttributes($link)
    {
        $js = '';
        $href = '';
        $blank = '';

        if (strpos($link, 'js') !== false) {
            $js = ' ' . $link;
            $href = '';
            $blank = '';
        } else {
            if (strpos($link, 'http') !== false) {
                $href = " href=\"{$link}\"";
                $blank = ' target="_blank"';
            } else {
                $href = " href=\"" . base_url() . $link . "\"";
                $blank = '';
            }
        }

        return ['href' => $href, 'blank' => $blank, 'js' => $js];
    }
}
