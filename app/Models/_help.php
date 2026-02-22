<?php

namespace App\Models;

use CodeIgniter\Model;

class _help extends Model
{
    public function funcaoExemplo($userOnly, $user_id)
    {
        $this->select("
                COUNT(bank.id) as contando,
                SUBSTRING(patient.name, 1, 20) as name,//PEGA OS 20 PRIMEIROS CARACTERES,
                CONCAT_WS(' ', doctor.name_prefix, doctor.name_social) as doctorName, //: Dr. Marcos Silva
                SUM(valor) as valor_somado,
                FORMAT(bk.value, 2, 'de_DE') as value,
                FORMAT(sum(valor), 0, 'de_DE') as valor_formatado,
                DATE_FORMAT(data, '%d/%m') as data_formatada,
                DATE_FORMAT(data, '%d/%m/%y') as data_formatada,
                DATE_FORMAT(dataHora, '%H:%i') as hora_formatada,
                IF(id = 1, '#48ff00', IF(id2 = 1, '#ff4500', '#2b2ece')) AS cor_resultante,
            ")
            ->join(
                'filhos',
                "filhos.id_pais = pais.id AND filhos.id = (SELECT MIN(id) FROM filhos WHERE id_pais = pais.id)",
                'left'
            ); //: PEGA APENAS O PRIMEIRO FILHO

        //! DATE_FORMAT = https://www.w3schools.com/mysql/func_mysql_date_format.asp

        //WHERE PARA PEGAR DIA E MES ATUAL (ANIVERSARIANTE POR EXEMPLO)
        $where = "DAY (data_nascimento) = DAY (CURDATE()) AND MONTH (data_nascimento) = MONTH (CURDATE())";


        //PEGA EM "idl_permissionsMatrix" TUDO QUE TIVER ",1," OU ",3,"
        $val = '1,3';
        $valReplaced = ',' . str_replace(array(','), ',|,', $val) . ',';
        $result = db_connect()
            ->query("SELECT name_short,idl_permissionsMatrix FROM user WHERE idl_permissionsMatrix REGEXP '{$valReplaced}'")
            ->getResultArray();
        return $this->json(200, $result);
        //VER MAIS SOBRE "REGEXP" https://stackoverflow.com/questions/4172195/mysql-like-multiple-values
    }

    public function update_com_join()
    {
        $q = db_connect();
        $q->query("
            UPDATE business AS b
            LEFT JOIN business_geocode AS g ON b.business_id = g.business_id
            SET b.mapx = g.latitude,
                b.mapy = g.longitude
            WHERE  (b.mapx = '' or b.mapx = 0) and
                g.latitude > 0
        ");
    }

    public function exemplo01()
    {
        $q = db_connect()->table('bank_locked_day');
        $q->select('date');
        $q->like('bankList', 'carlos');
        $q->orderBy('date DESC');
        return $q->get()->getRow();
    }

    public function colocaIdNoFinalDaLista()
    {
        $data['list'] = $modCategory
            ->select('id, name')
            ->like('name', $find, 'after')
            // força o ID 14 para o final
            ->orderBy('CASE WHEN id = 14 THEN 1 ELSE 0 END', 'ASC', false)
            ->orderBy('name', 'ASC')
            ->findAll(15);
    }
}
