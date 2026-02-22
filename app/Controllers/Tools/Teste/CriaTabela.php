<?php
//:METODO DE CRIAR TABELA

namespace App\Controllers\Tools\Teste;

use App\Controllers\BaseController;

class CriaTabela extends BaseController
{
    public function criarTabela()
    {
        $forge = \Config\Database::forge();

        $fields = [
            'id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'nome' => [
                'type'           => 'VARCHAR',
                'constraint'     => '255',
                'null'           => false,
            ],
            'teste' => [
                'type'           => 'VARCHAR',
                'constraint'     => '255',
                'null'           => false,
            ],
            'descricao' => [
                'type'           => 'TEXT',
                'null'           => true,
            ],
            'codigo_barras' => [
                'type'           => 'VARCHAR',
                'constraint'     => '100',
                'null'           => true,
            ],
            'categoria_id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'null'           => true,
            ],
            'quantidade' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'default'        => 0,
            ],
            'unidade' => [
                'type'           => 'VARCHAR',
                'constraint'     => '50',
                'null'           => true,
            ],
            'preco_unitario' => [
                'type'           => 'DECIMAL',
                'constraint'     => '10,2',
                'null'           => true,
            ],
            'fornecedor_id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'null'           => true,
            ],
            'data_validade' => [
                'type'           => 'DATE',
                'null'           => true,
            ],
            'lote' => [
                'type'           => 'VARCHAR',
                'constraint'     => '50',
                'null'           => true,
            ],
            'localizacao' => [
                'type'           => 'VARCHAR',
                'constraint'     => '100',
                'null'           => true,
            ],
            'estoque_minimo' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'default'        => 0,
            ],
            'estoque_maximo' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'null'           => true,
            ],
            'observacoes' => [
                'type'           => 'TEXT',
                'null'           => true,
            ],
            'created_at' => [
                'type'           => 'TIMESTAMP',
                'null'           => false,
            ],
            'updated_at' => [
                'type'           => 'TIMESTAMP',
                'null'           => false,
                'on_update'      => 'CURRENT_TIMESTAMP',
            ],
        ];

        $forge->addField($fields);
        $forge->addKey('id', true);
        if ($forge->createTable('estoque_insumos', true)) {
            return 'Tabela criada com sucesso!';
        } else {
            return 'Erro ao criar tabela.';
        }
    }
}
