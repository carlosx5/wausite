<?php

namespace App\Models\Marketing\Lead;

use App\Models\Marketing\Lead\Marketing_lead_Model;

class Report_Model extends Marketing_lead_Model
{
    public function getList($where)
    {
        $this->select('
            id,
            id_status,
            id_marketing,
            id_session,
            device,
            zap_clicked,
            name,
            cell,
            email,
            screen,
            date,
            state
        ');
        $this->where($where);
        $this->orderBy('id DESC');
        $list = $this->findAll();

        return $list;
    }
}
