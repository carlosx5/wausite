<?php

namespace App\Controllers\Site;

use App\Controllers\UnloggedController;

class SiteView extends UnloggedController
{
    public function index()
    {
        $data['refresh'] = uniqid();
        $data['video'] = base_url('dataSistem/videos/videotop01.mp4?v=') . $data['refresh'];
        $data['logo'] = base_url('dataSistem/images/logos/wau/wau300x117_2.webp?v=') . $data['refresh'];

        $data['content02_1'] = base_url('dataSistem/images/content02/content02_1.webp?v=') . $data['refresh'];
        $data['content02_2'] = base_url('dataSistem/images/content02/content02_2.webp?v=') . $data['refresh'];
        $data['content02_3'] = base_url('dataSistem/images/content02/content02_3.webp?v=') . $data['refresh'];

        echo view('site/main.html', $data);
    }
}
