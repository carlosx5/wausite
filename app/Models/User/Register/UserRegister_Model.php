<?php

namespace App\Models\User\Register;

use App\Libraries\Models\WauModel;

class UserRegister_Model extends WauModel
{
    protected $table = 'user';
    protected $primaryKey = 'id';
    protected $returnType = 'object';

    protected $useTimestamps = true;


    /**
     * Busca "user" + "user__status"
     *
     * @param boolean|true|false $status
     */
    public function get_userStatus($find, $select = '*', $status = false)
    {
        $status = $status ? 'st.status >= 0' : 'st.status > 0'; //false=apenas ativos|true=todos

        $resp = $this->select($select)
            ->join('user__status st', 'st.id = user.id', 'LEFT')
            ->where('user.id', $find)
            ->where($status)
            ->first();

        return $resp;
    }

    /**
     * Insert "user" + "user__status"
     *
     * @param array $data
     *
     * @return string $newId - Valor do novo ID
     */
    public function set_userAndStatus($data)
    {
        $modStatus = new \App\Models\User\UserStatus_Model();

        //ADD user
        $newId = $this->protect(false)->insert($data);

        //ADD user__status
        $result = $modStatus->protect(false)->insert(['id' => $newId, 'status' => 1]);

        return $newId;
    }
}
