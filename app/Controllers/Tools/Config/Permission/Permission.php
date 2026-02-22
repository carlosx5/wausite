<?php

namespace App\Controllers\Tools\Config\Permission;

use App\Controllers\ViewController;

class Permission extends ViewController
{
    /** //-INDEX */
    public function index()
    {
        $this->initBackend(51);
        session()->setFlashdata('sidebar', [
            'menuActive' => 'Configurações',
            'viewTitle' => 'Cadastro de Permissões',
            'contenList' => [],
        ]);

        $data = $this->dataCreate(
            'tools/config/permission/permission',
            'tools/config/permission/permission',
            'permission_config'
        );

        return (viewShow('tools/config/permission/permission', $data));
    }

    /** //+BUSCA DADOS */
    public function get_data()
    {
        // $this->permission_check(50);

        $data = [];
        $getChoice = $this->request->getVar('getChoice');
        $idAccess = $this->request->getVar('idAccess');
        $idView = $this->request->getVar('idView');

        if (!is_array($getChoice)) {
            echo json_encode(['status' => 0, 'msg' => 'erro: 43133']);
            die;
        }

        //BUSCA VIEWS
        if (in_array('views', $getChoice)) {
            $data['views'] = $this->get_views_data();
        }

        //SE "$idView" VIER COM VALOR ZERADO PEGA O ID DO PRIMEIRO REGISTRO
        $idView = $idView > 0 ? $idView : $data['views'][0]['id'];

        //BUSCA PERMISSÕES REFERENTE A VIEW SELECIONADA
        if (in_array('permissions', $getChoice)) {
            $data['permissions'] = $this->get_permissions_data($idView);
        }

        dieJson(200, $data);
    }

    /** //-BUSCA DADOS DAS VIEWS */
    private function get_views_data()
    {
        $views = db_connect()
            ->table('permissions_view')
            ->select('id, name, access_clinic, access_agent, access_collector, access_patient, access_advanced')
            ->orderBy('ord')
            ->get()
            ->getResultArray();

        return $views;
    }

    /** //-BUSCA DADOS DAS PERMISSÕES */
    private function get_permissions_data($idView)
    {
        if (!$idView)
            return [];

        $permissions = db_connect()
            ->table('permissions')
            ->select('id,id_views,name')
            ->where('id_views', $idView)
            ->orderBy('ord')
            ->get()
            ->getResultArray();

        return $permissions;
    }

    /** //+SALVA DADOS */
    public function update_data()
    {
        // $this->permission_check(52);

        $newViews = json_decode(json_encode($this->request->getVar('views')), true);
        $newPermissions = json_decode(json_encode($this->request->getVar('permissions')), true);

        //ATAULIZA VIEWS SE VIER LISTA EM "$newViews"
        if ($newViews) {
            foreach ($newViews as $key => $val) {
                if ($val['id'] == 'new') { //SE FOR NOVO
                    //ADD VIEW
                    db_connect()
                        ->table('permissions_view')
                        ->insert([
                            'name' => $val['name'],
                            'ord' => $key + 1,
                        ]);

                    $newId = db_connect()->insertId();

                    //ADD PRIMEIRA PERMISSION
                    db_connect()
                        ->table('permissions')
                        ->insert([
                            'id_views' => $newId,
                            'name' => 'Tela',
                            'ord' => 1,
                        ]);
                } else { //SE JÁ EXISTE
                    db_connect()
                        ->table('permissions_view')
                        ->where('id', $val['id'])
                        ->update([
                            'name' => $val['name'],
                            'access_clinic' => $val['access_clinic'],
                            'access_agent' => $val['access_agent'],
                            'access_collector' => $val['access_collector'],
                            'access_patient' => $val['access_patient'],
                            'access_advanced' => $val['access_advanced'],
                            'ord' => $key + 1,
                        ]);
                }
            }
        }

        //ATUALIZA PERMISSIONS SE VIER LISTA EM "$newPermissions"
        if ($newPermissions) {
            foreach ($newPermissions as $key => $val) {
                if ($val['id'] == 'new') { //SE FOR NOVO
                    db_connect()
                        ->table('permissions')
                        ->insert([
                            'id_views' => $val['id_views'],
                            'name' => $val['name'],
                            'ord' => $key + 1,
                        ]);
                } else { //SE JÁ EXISTE
                    db_connect()
                        ->table('permissions')
                        ->where('id', $val['id'])
                        ->update([
                            'id_views' => $val['id_views'],
                            'name' => $val['name'],
                            'ord' => $key + 1,
                        ]);
                }
            }
        }

        dieJson(200);
    }
}
