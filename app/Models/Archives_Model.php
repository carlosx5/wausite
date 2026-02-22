<?php

namespace App\Models;

use CodeIgniter\Model;

class Archives_Model extends Model
{
    protected $table = 'archives';
    protected $primaryKey = 'id';
    protected $returnType = 'array';

    public function upload($idTable, $idTableName, $uri)
    {
        $file = $_FILES['fotos']['name'][0];

        if (!$idTable) {echo json_encode(['console' => 'erro: 43123']);die;};
        if (!isset($file)) {echo json_encode(['console' => 'erro: 43124']);die;};

        //CRIA NOME E EXTENÇÃO DO ARQUIVO
        $fileName = sprintf('%03d', $idTableName) . '_' . sprintf('%09d', $idTable) . '_' . substr(time(), -4);
        $fileExtension = explode('/', $_FILES['fotos']['type'][0])[1];

        //SALVA NA TABELA
        db_connect()->table('archives')->insert([
            'id_table' => $idTable,
            'id_tableName' => $idTableName,
            'findFast' => "{$idTable}_{$idTableName}",
            'name' => $fileName,
            'extension' => $fileExtension,
        ]);

        //SALVA NA PASTA
        move_uploaded_file($_FILES['fotos']['tmp_name'][0], "{$uri}{$fileName}.{$fileExtension}");
    }

    public function archive_delete($fileId, $uri)
    {
        $arquive = $this->find($fileId);

        $arquiveName = $arquive['name'] . '.' . $arquive['extension'];

        if (file_exists($uri . $arquiveName)) {
            if (unlink($uri . $arquiveName)) { //remove imagem da pasta
                //OK
            } else {
                echo json_encode(['console' => 'erro: 43121']);die;
            };
        } else {
            echo json_encode(['console' => 'erro: 43122']);die;
        };

        $this->delete($fileId);
    }

}
