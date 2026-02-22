<?php

namespace App\Controllers\User;

use App\Controllers\ViewController;

class UserMain extends ViewController
{
    //:INDEX
    public function index(): void
    {
        $this->initBackend(999);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Usuários',
            'contenList' => [],
        ]);

        //:Adiciona script apenas para dev (SortableJS)
        if (session()->log_dev == 1)
            $dataJs[] = 'user/permission/config';
        ///
        $dataJs[] = 'p-quillEditor';
        $dataJs[] = 'user/userMain';

        $data = $this->dataCreate(
            'p-quillEditor,user/userMain',
            $dataJs,
            'user'
        );
        $data['isDev']              = session()->log_dev == 1 ? true : false;
        $data['visibleRegister']    = hasPermission('50P') ? '' : 'd-none';
        $data['visibleRecord']      = hasPermission('143P') ? '' : 'd-none';
        $data['visiblePerm']        = hasPermission('51P') ? '' : 'd-none';

        viewShow('user/userMain', $data);
    }
}
