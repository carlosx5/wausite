<?php

namespace App\Controllers\Stock;

use App\Controllers\FetchController;
use App\Libraries\Validations\SessionValidate;
use App\Models\Stock\Register\StockRegister_Model;

class StockMain extends FetchController
{
    public $libSessionValidate;
    public $modRegister;
    private $table = 'stock';

    public function __construct()
    {
        $this->libSessionValidate = new SessionValidate();
        $this->modRegister = new StockRegister_Model();
    }


    /** //:INICIA VALIDAÇÃO DE ESTOQUE
     * 
     * / $access -> Acesso a ser checado
     * / $stockId -> Id do estoque a ser validado
     * / $refreshSession -> Se deve atualizar ou não a sessão (padrão = false)
     * /                 -> Atualiza o nome qdo é alterado ou qdo é inserido um novo registro
     * /                 -> Atualiza o id qdo é inserido um novo registro
     * 
     */
    public function stockMain($access, $stockId, $refreshSession = false)
    {
        //:Checagem invalida -> retorna 468 (sem permissão)
        if (!parent::initFetch($access))
            dieJson(468);

        //:Novo -> retorna 'new'
        if ($stockId === 'new' && $access === 11)
            return 'new';

        //:Id inválido -> retorna 455 (id inválido)
        if (intval($stockId) < 1)
            dieJson(455);

        //:Id bate com session -> retorna dados da session atualizada e validada
        $checkIsOk = $this->libSessionValidate->check($this->table, $stockId);
        if ($checkIsOk)
            return $this->libSessionValidate->get();

        //:$refreshSession === false ->  NÃO da continuidade com Id diferente
        if ($refreshSession === false)
            dieJson(455);

        //:Validação do novo Id foi ok -> retorna dados da session atualizada e validada
        $resp = $this->getStockDataForCheck($stockId);
        $respValidate = parent::validateForNewSession($resp, 10, $this->table);
        if ($respValidate === true) {
            //:Atualiza session
            $this->setSession($resp);

            //:Retorna session atualizada e validada
            return $this->libSessionValidate->get();
        }

        //:Retorna fetch com erro de validação
        dieJson(458);
    }

    //:ATUALIZA SESSION
    public function setSession($data)
    {
        $this->libSessionValidate->set([
            'table'         => $this->table,
            'stockId'     => $data->stockId,
            'stockName'   => $data->stockName,
        ]);
    }

    //:RETORNA NOVOS DADOS DO BD PARA CHECAGEM
    private function getStockDataForCheck($stockId)
    {
        return $this->modRegister
            ->select('
                stock.id as stockId,
                stock.name as stockName,
                cl.id as clinicId,
                cl.id_clinicMain as clinicMainId,
            ')
            ->join('clinic cl', 'cl.id = stock.id_clinic', 'left')
            ->where('stock.id', $stockId)
            ->first();
    }
}
