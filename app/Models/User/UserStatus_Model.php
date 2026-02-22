<?php

namespace App\Models\User;

use CodeIgniter\Model;

class UserStatus_Model extends Model
{
    protected $table = 'user__status';
    protected $primaryKey = 'id';
    protected $returnType = 'object';
    protected $allowedFields = ['id', 'status'];

    public function forceLoginByUser($userId)
    {
        $this->protect(false)
            ->update($userId, ['doLogin' => 1]);
    }

    public function forceLoginByClinic($clinicId)
    {
        //!Não foi testado
        $this->protect(false)
            ->where('user.id_clinic', $clinicId)
            ->join('user', 'user.id = user__status.id')
            ->update(['doLogin' => 1]);
    }
}
