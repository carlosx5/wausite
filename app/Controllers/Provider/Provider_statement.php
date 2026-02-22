<?php

namespace App\Controllers\Provider;

use App\Controllers\BaseController;

class Provider_statement extends BaseController
{
    /**
     * Método formação de tela PC
     */
    public function index()
    {
        $this->permission_check(118);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Extratos',
            'viewTitle' => 'Extrato Fornecedor',
            'contenList' => ['statement/statement_btn_layout'],
        ]);

        $js = 'modules/bank_entry_module,factory/pagination';
        $js .= ',factory/ajaxSelect,statement/statement,statement/statement_provider';
        $js .= ',modules/bank/bank_register_module,modules/bank/bank_check_module';
        $data = $this->dataCreate('statement/statement', $js);
        $data['title'] = 'Fornecedor';
        $data['varJS']['table'] = 'provider';

        echo view('templates/_header.html', $data);
        echo view('sidebar/sidebar.html');
        echo view('statement/statement.html');
        echo view('templates/_footer.html');
    }

    /**
     * Métoto para buscar clínica
     */
    public function find()
    {
        $this->permission_check(88);

        $find = $this->request->getVar('find');

        $data['list'] = db_connect()->table('providers')
            ->select('id, name_short as col1')
            ->like('name_short', $find, 'LEFT')
            ->orderBy('name_short')
            ->get()
            ->getResultArray();

        $data['status'] = 200;
        echo json_encode($data);
        die;
    }
}
