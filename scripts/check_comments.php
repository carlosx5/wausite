<?php
//: Verificador de comentários iniciando com //: em arquivos .js
//: Uso: php scripts/check_comments.php [diretorio_base]

$base = $argv[1] ?? 'public/assets/js';
if (!is_dir($base)) {
    fwrite(STDERR, "Diretório não encontrado: {$base}\n");
    exit(2);
}

$violations = [];
$rii = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS)
);

foreach ($rii as $fileInfo) {
    if (!$fileInfo->isFile()) continue;
    $path = $fileInfo->getPathname();
    if (!preg_match('/\.js$/i', $path)) continue;

    $lines = file($path);
    foreach ($lines as $idx => $line) {
        //: Regra: linhas que começam com // devem ter //:
        if (preg_match('/^\s*\/\/(?!:)/', $line)) {
            $violations[] = [
                'file' => $path,
                'line' => $idx + 1,
                'content' => rtrim($line)
            ];
        }
    }
}

if ($violations) {
    echo "Comentários fora do padrão (esperado prefixo //:):\n";
    foreach ($violations as $v) {
        echo "- {$v['file']}#{$v['line']}: {$v['content']}\n";
    }
    echo "\nTotal: " . count($violations) . " violações.\n";
    exit(1);
}

echo "Sem violações: todos os comentários iniciam com //:.\n";
exit(0);
