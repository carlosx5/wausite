<?php

namespace App\Models\User;

use CodeIgniter\Model;

class User_Employee_Model extends Model
{
    protected $table = 'users_employee';
    protected $primaryKey = 'id_user';
    protected $returnType = 'array';

    public function this_update($id, $data)
    {
        $response = $this->find($id);

        if (floatval($data['vl_salary']) == 0 || floatval($data['vl_salary']) == 0) {
            db_connect()->table('users_employee')
                ->delete(['id_user' => $id]);
        } elseif (!$response) {
            db_connect()->table('users_employee')
                ->insert($data);
        } else {
            unset($data['id_user']);
            db_connect()->table('users_employee')
                ->where('id_user', $id)
                ->update($data);
        };
    }
}
