<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;

class RestController extends ResourceController
{
    private $tokenExtern = 'pqFpYbMC4xIQD83klLYO03EFVUs5Sinyy';

    /**
     * Verifica token
     */
    public function checkToken()
    {
        date_default_timezone_set('America/Sao_Paulo');

        //CONFERE TOKEN EXTERNO
        if ($this->request->getHeaderLine('token') === $this->tokenExtern) {
            return true;
        }

        //CONFERE TOKEN INTERNO
        $token = session()->token;
        //
        if (!$token) {
            echo json_encode(['status' => 450]);
            die;
        }
        //
        if ($this->request->getHeaderLine('token') != $token) {
            echo json_encode(['status' => 451, 'msg' => 'Invalid Token']);
            die;
        }

        return true;
    }

    /**
     * Verifica se tem permissão
     */
    public function permission_check($access, $idCheck = '#', $method = 'POST')
    {
        //CHECA TOKEN
        // $this->XXXcheckToken();

        //VERIFICA ID
        $idCheck = $this->idCheck($idCheck);

        //VERIFICA SE VEIO VALOR
        if (!$access) {
            return false;
        };

        //CONFERE MÉTODO
        if (strtoupper($this->request->getMethod()) !== strtoupper($method)) {
            echo json_encode(['status' => 453, 'msg' => 'Metodo nao permitido!']);
            die;
        };

        //LIBERA GERAL
        if ($access == 999) {
            return $idCheck;
        };

        //TRATA ARRAY
        if (is_array($access)) {
            //JÁ VEM COMO ARRAY
        } elseif (strstr($access, ',')) {
            $access = explode(',', $access);
        } else {
            $access = [$access];
        };

        //COMPARA
        foreach ($access as $ac) {
            $ac = ',' . $ac . ',';
            if (strstr(session()->permissions, $ac)) {
                return $idCheck;
            };
        };

        //NÃO ENCONTRADO
        echo json_encode(['status' => 453, 'msg' => 'Sem permissao!']);
        die;
    }

    /**
     * Passa ID para numérico e faz a validação
     */
    public function idCheck($id)
    {
        if ($id == '#') {
            return $id;
        };

        $idNumber = intval($this->request->getPost($id));

        if (!$idNumber) {
            echo json_encode(['status' => 455]);
            die;
        };

        return $idNumber;
    }

    /**
     * Finaliza debug retornando JSON
     */
    public function dieJson($par1 = false, $par2 = false)
    {
        if (is_numeric($par1)) {
            if ($par2) {
                if (is_object($par2)) {
                    $par2 = (array) $par2;
                };

                if (is_array($par2)) {
                    $data = $par2;
                } else {
                    $data['msg'] = $par2;
                };
                $data['status'] = $par1;
            } else {
                $data['status'] = $par1;
                $data['parametro-2'] = $par2;
            };
        } else {
            $data['par1'] = $par2;
            $data['par2'] = $par2;
        };

        die(json_encode($data));
    }
}
