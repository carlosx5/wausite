<?php

namespace App\Controllers\User\Invite;

class User_invite_database
{
    public static function table($acting)
    {
        switch ($acting) {
            case '3':
                return [
                    'access' => 106,
                    'id' => 3,
                    'name' => 'coletador',
                ];
            case '5':
                return [
                    'access' => 93,
                    'id' => 5,
                    'name' => 'médico',
                ];
            case '6':
                return [
                    'access' => 91,
                    'id' => 6,
                    'name' => 'agente',
                ];
            case '14':
                return [
                    'access' => 137,
                    'id' => 14,
                    'name' => 'funcionário',
                ];
        }
        ;

        return ['access' => 0];
    }
}
