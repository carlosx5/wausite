<?php

namespace App\Controllers\Tools\Config\Partner;

use App\Controllers\BaseController;
use App\Models\Clinic_register_Model;
use App\Models\User\User_register_Model;
use App\Models\Bank\Entry\EntryAdd_Model;

class Partner extends BaseController
{
    public function __construct()
    {
        $this->modClinic = new Clinic_register_Model();
        $this->modUser = new User_register_Model();
        $this->modEntryAdd = new EntryAdd_Model();
    }

    public function index()
    {
        $this->initBackend(9, 'SbMenuOn=Configurações');

        $data = $this->dataCreate(
            'tools/config/partner/partner',
            'tools/config/partner/partner',
            'partner'
        );
        $data['refresh'] = session()->refresh;

        return (viewShow('tools/config/partner/partner', $data));
    }

    /**
     * Métoto para buscar dados
     */
    public function get_data()
    {
        $clinicId = $this->initFetch(9, 'clinicId');
        $getList = ',' . $this->request->getVar('getList') . ',';

        //BUSCA DADOS DO CADASTRO DE ESTOQUE
        if (strpos($getList, 'register')) {
            $data['clinic'] = $this->get_register($clinicId);
        };

        //BUSCA DADOS DOS PROCEDIMENTOS DO ESTOQUE
        if (strpos($getList, 'list')) {
            $data['list'] = $this->get_list($clinicId);
        };

        return $this->json(200, $data);
    }

    /**
     * Métoto para buscar dados da clínica
     */
    public function get_register($clinicId)
    {
        $resp = $this->modClinic
            ->select('
                id,
                name_short as name
            ')
            ->find($clinicId);

        return $resp;
    }

    /**
     * Métoto para buscar lista de participação
     */
    public function get_list($clinicId)
    {
        $resp = $this->modUser
            ->select("
                up.id as id,
                user.id as id_user,
                $clinicId as id_clinic,
                user.name_short as name,
                up.pc_participation as pc,
                '0' as vl
            ")
            ->join('users_partner up', 'up.id_user = user.id')
            ->where('up.id_clinic', $clinicId)
            ->findAll();

        return $resp;
    }

    /**
     * Métoto para salvar lista de participação
     */
    public function save_list()
    {
        $clinicId = $this->initFetch(9, 'clinicId');
        $list = $this->request->getVar('list');

        //CHECA SOMA DE PORCENTAGENS
        $sum = 0;
        foreach ($list as $l) {
            $sum += $l->pc;
        };
        //
        if ($sum != 100) {
            return $this->json(200, "sum = {$sum}");
        };

        //SALVA
        $db = \Config\Database::connect();
        $partner = $db->table('users_partner');
        foreach ($list as $l) {
            if ($l->id > 0 && $l->pc == 0) { //DELETA
                $partner->where('id', $l->id);
                $partner->delete();
            } elseif ($l->id > 0) { //ALTERA
                $partner->where('id', $l->id);
                $partner->update(['pc_participation' => $l->pc]);
            } elseif ($l->id == 0) {
                $partner->insert([ //INSERE
                    'id_user' => $l->id_user,
                    'id_clinic' => $l->id_clinic,
                    'pc_participation' => $l->pc
                ]);
            };
        };

        $data['list'] = $this->get_list($clinicId);
        return $this->json(200, $data);
    }

    /**
     * Métoto para salvar lançamentos de aporte
     */
    public function save_entryes()
    {
        $clinicId = $this->initFetch(9, 'clinicId');
        $date = $this->request->getVar('date');
        $value = $this->request->getVar('value');
        $list = $this->request->getVar('list');

        //ENTRADA P/ CLÍNICA
        $data = [
            'id_clinic' => $clinicId,
            'id_source' => 18,
            'source_category' => 0,
            'description' => 'Aporte',
            'date' => $date,
            'value' => mask_val_1($value),
            'available' => 1,
            'links' => [
                [
                    'destination' => 9,
                    'table' => 10,
                    'positive' => 1
                ],
                [
                    'destination' => 8,
                    'table' => 1,
                    'positive' => 1
                ]
            ]
        ];
        //
        $this->modEntryAdd->entryAdd($data);

        //SAÍDA DE USUÁRIOS
        foreach ($list as $l) {
            $data = [
                'id_clinic' => $clinicId,
                'id_source' => 18,
                'source_category' => 0,
                'description' => 'Aporte',
                'date' => $date,
                'value' => mask_val_1($l->vl),
                'available' => 1,
                'links' => [
                    [
                        'destination' => 9,
                        'table' => 10,
                        'positive' => 2
                    ],
                    [
                        'destination' => $l->id_user,
                        'table' => 11,
                        'positive' => 2
                    ]
                ]
            ];
            //
            $this->modEntryAdd->entryAdd($data);
        };

        return $this->json(200);
    }
}
