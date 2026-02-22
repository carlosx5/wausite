<?php

namespace App\Controllers\Home;

use App\Controllers\ViewController;

class Home extends ViewController
{
    public function index()
    {
        $this->initBackend(999);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Home',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            'home/home',
            'home/home',
            'home'
        );

        //:cor + complemento
        $refresh = $this->refresh;
        $imageName = $data['theme'] . "01.webp?v=$refresh";

        $data['image'] = base_Url("/dataSistem/images/home/$imageName");
        $data['logo']  = base_Url("/dataSistem/images/logos/wau/wau300x117_2.webp?v=$refresh");
        $data['ia']    = base_Url("/dataSistem/images/logos/ia/logo01.webp?v=$refresh");
        $data['varJS']['video'] = [
            'home' => 'eb19184e-dc5f-4068-9ec5-91a33d2d5a37',
        ];

        return viewShow('home/home*cel', $data);
    }
}
