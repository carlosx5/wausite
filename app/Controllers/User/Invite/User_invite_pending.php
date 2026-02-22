<?php

namespace App\Controllers\User\Invite;

use App\Controllers\BaseController;
use App\Models\Invite_link_Model;
use App\Models\User\User_register_Model;

class User_invite_pending extends BaseController
{
    /**
     * Método para listar convites parados
     */
    public function index()
    {
        $this->initBackend(999);

        $logUserId = session()->log_userId;
        $screenWidth = $this->screenWidth;

        if ($screenWidth > 768) {
            //BUSCA MÉDICOS PENDENTES
            $q = db_connect()->table('invites_link');
            $q->select('
                    invites_link.id,
                    invites_link.name,
                    invites_link.cell,
                    invites_link.link,
                    user.name_short as inviting
            ');
            if (!checkAccess(91)) {
                $q->where('id_inviting', $logUserId);
            }
            $q->join('user', 'user.id = invites_link.id_inviting', 'left');
            $list = $q->get()->getResultArray();
        } else {
            //BUSCA MÉDICOS PENDENTES
            $q = db_connect()->table('invites_link');
            $q->select('id, name, cell, link');
            if (!checkAccess(91)) {
                $q->where('id_inviting', $logUserId);
            }
            $list = $q->get()->getResultArray();
        };

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Convites',
            'viewTitle' => 'Convites',
        ]);

        $data = $this->dataCreate('', '', '');
        $data['list'] = $list;

        return (viewShow('user/invite/user_invite_pending*cel', $data));
    }
}
