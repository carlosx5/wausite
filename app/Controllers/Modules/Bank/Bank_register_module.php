<?php

namespace App\Controllers\Modules\Bank;

use App\Controllers\BaseController;
use App\Models\Bank\Bank_register_Model;

class Bank_register_module extends BaseController
{
    public function __construct()
    {
        $this->modBank = new Bank_register_Model();
    }

    public function get_register()
    {
        $bankId = $this->initFetch(129, 'bankId');

        $data['registers'] = $this->modBank->get_registers($bankId);

        return $this->json(200, $data);
    }

    public function set_register()
    {
        $bankId = $this->initFetch(9, 'bankId');

        $post = $this->request->getVar('data');

        $data = [];
        $data['description'] = $post->description;
        $data['value'] = mask_val_1($post->value);
        $data['date'] = $post->date;
        $data['month'] = $post->month;
        if (isset($post->id_source_category)) {
            $data['id_source_category'] = $post->id_source_category;
        }
        ;

        db_connect()->table('bank')
            ->where('id', $bankId)
            ->update($data);

        if (isset($post->id_bankLink1)) {
            db_connect()->table('bank_link')
                ->where('id', $post->id_bankLink1)
                ->update(['id_destination' => $post->id_destination_bankLink1]);
        }
        ;

        if (isset($post->id_bankLink2)) {
            db_connect()->table('bank_link')
                ->where('id', $post->id_bankLink2)
                ->update(['id_destination' => $post->id_destination_bankLink2]);
        }
        ;

        dieJson(200);
    }
}
