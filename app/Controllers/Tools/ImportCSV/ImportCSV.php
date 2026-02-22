<?php
//*CONTROLER P/ IMPORTAÇÃO DE ARQUIVO CSV
//*NUNCA FOI TESTADO

namespace App\Controllers\Tools\ImportCSV;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use App\Models\CadastroModel; // Não se esqueça de importar seu Model

class ImportCsv extends BaseCommand
{
    /**
     * The Command's Group.
     *
     * @var string
     */
    protected $group = 'Database';

    /**
     * The Command's Name.
     *
     * @var string
     */
    protected $name = 'import:csv'; // Este é o comando que você vai digitar

    /**
     * The Command's Description.
     *
     * @var string
     */
    protected $description = 'Importa um arquivo CSV (cadcsv.csv) da raiz do projeto para a tabela de cadastro.';

    /**
     * The Command's Usage.
     *
     * @var string
     */
    protected $usage = 'import:csv';

    /**
     * The Command's Arguments.
     *
     * @var array
     */
    protected $arguments = [];

    /**
     * The Command's Options.
     *
     * @var array
     */
    protected $options = [];

    /**
     * Actually execute a command.
     *
     * @param array $params
     */
    public function run(array $params)
    {
        CLI::write('Iniciando a importação do arquivo CSV...', 'green');

        // 1. Definir o caminho do arquivo na raiz do projeto
        $filePath = ROOTPATH . 'cadcsv.csv';

        // 2. Verificar se o arquivo existe
        if (!file_exists($filePath)) {
            CLI::error('Erro: O arquivo cadcsv.csv não foi encontrado na raiz do projeto.');
            return;
        }

        // 3. Ler o arquivo e preparar os dados
        $dataToInsert = [];
        $isHeader = true; // Flag para pular a primeira linha (cabeçalho)
        $delimiter = ','; // Altere para ';' se seu CSV usar ponto e vírgula

        if (($handle = fopen($filePath, "r")) !== FALSE) {
            while (($row = fgetcsv($handle, 1000, $delimiter)) !== FALSE) {
                if ($isHeader) {
                    $isHeader = false;
                    continue;
                }

                if (count($row) >= 2) {
                    $dataToInsert[] = [
                        'nome'      => $row[0], // Primeira coluna
                        'trelefone' => $row[1]  // Segunda coluna
                    ];
                }
            }
            fclose($handle);
        } else {
            CLI::error('Não foi possível abrir o arquivo para leitura.');
            return;
        }

        // 4. Inserir no banco de dados
        if (!empty($dataToInsert)) {
            $model = new CadastroModel();

            // Usando insertBatch para uma única query de inserção (mais performático)
            if ($model->insertBatch($dataToInsert)) {
                $rowCount = count($dataToInsert);
                CLI::write("Sucesso! $rowCount registros foram importados para a tabela 'cadastro'.", 'green');
            } else {
                CLI::error('Ocorreu um erro ao tentar inserir os dados no banco.');
            }
        } else {
            CLI::write('Nenhum dado válido para importação foi encontrado no arquivo.', 'yellow');
        }
    }
}
