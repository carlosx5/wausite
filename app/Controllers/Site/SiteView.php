<?php

namespace App\Controllers\Site;

use App\Controllers\UnloggedController;

class SiteView extends UnloggedController
{
    public function index()
    {
        $dv = uniqid(); //.dv = data version
        $data['version'] = $dv;
        $data['video'] = "https://vz-09ddef2b-e28.b-cdn.net/1ceea333-3af2-46a8-bf4d-66f9f5c05c68/playlist.m3u8";
        $data['logo'] = base_url("dataSistem/images/logos/wau/wau300x117_2.webp?v=$dv");
        ///
        $data['content02_1'] = base_url("dataSistem/images/content02/content02_1.webp?v=$dv");
        $data['content02_2'] = base_url("dataSistem/images/content02/content02_2.webp?v=$dv");
        $data['content02_3'] = base_url("dataSistem/images/content02/content02_3.webp?v=$dv");
        ///
        $data['content03_1'] = base_url("dataSistem/images/content03/content03_1.webp?v=$dv");

        echo view('site/main.html', $data);
    }
}
