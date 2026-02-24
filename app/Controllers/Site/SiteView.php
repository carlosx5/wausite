<?php

namespace App\Controllers\Site;

use App\Controllers\UnloggedController;

class SiteView extends UnloggedController
{
    public function index()
    {
        $dv = uniqid(); //.dv = data version
        $data['refresh'] = $dv;
        $data['video'] = base_url("dataSistem/videos/videotop01.mp4?v=$dv");
        $data['logo'] = base_url("dataSistem/images/logos/wau/wau300x117_2.webp?v=$dv");

        $data['content02_1'] = base_url("dataSistem/images/content02/content02_1.webp?v=$dv");
        $data['content02_2'] = base_url("dataSistem/images/content02/content02_2.webp?v=$dv");
        $data['content02_3'] = base_url("dataSistem/images/content02/content02_3.webp?v=$dv");

        echo view('site/main.html', $data);
    }
}
