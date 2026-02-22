<?php

namespace App\Libraries\Models;

use CodeIgniter\Model;

class WauModel extends Model
{
    public function saveWau($data, $optLock = null)
    {
        $data = (object) $data;

        if ($data->id === 'new') return $this->insertWau($data);
        if ((int) $data->id > 0) return $this->updateWau($data, $optLock);
    }

    public function insertWau($data)
    {
        unset(
            $data->id,
            $data->created_at
        );

        //:Define "id_clinic" e "id_clinicMain" pela sessão
        $data->id_clinicMain = session('clinic')['idMain'];
        $data->id_clinic = session('clinic')['id'];

        //:Busca último id da clínica
        $lastId = $this->select('id_display')
            ->where('id_clinic', $data->id_clinic)
            ->orderBy('id', 'DESC')
            ->first();

        //:Vazio (deve ser o primeiro registro da clínica) ? "0" : explode e pega apenas o id em id_display
        $lastId = empty($lastId)
            ? '0'
            : explode('-', $lastId->id_display)[0];

        //:Gera id_display
        $newId = ((int) $lastId) + 1;
        $data->id_display = "{$newId}-{$data->id_clinic}";

        //:Insere
        try {
            $this->protect(false)->insert($data);
        } catch (\Throwable $e) {
            dieJson(400, 'Erro ao salvar: ' . $e->getMessage());
        }

        //:Retorna id
        return $this->getInsertID();
    }

    public function updateWau($data, $optLock)
    {
        $id = $data->id;

        //:Valida Optimistic Lock
        if ($optLock) {
            $optLockDb = $this->select('updated_at')->where('id', $id)->first();
            if ($optLockDb->updated_at !== $optLock)
                dieJson(453);
        }

        //:Remove campos que nunca devem ser atualizados
        unset($data->id);
        unset($data->id_display);

        //:Atualiza
        try {
            $this->protect(false)->update($id, $data);
        } catch (\Throwable $e) {
            dieJson(400, 'Erro ao salvar: ' . $e->getMessage());
        }

        //:Retorna id
        return $id;
    }
}
