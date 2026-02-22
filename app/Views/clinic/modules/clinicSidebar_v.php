<div data-mouseover="false">
    <?php
    echo view(
        'sidebar/templates/buttons/_search.html',
        ['btnTxt' => 'Busca Clínica']
    );
    echo view(
        'sidebar/templates/buttons/_new.html',
        ['btnTxt' => 'Nova Clínica']
    );
    echo view(
        'sidebar/templates/buttons/_update.html',
        ['btnTxt' => 'Salvar']
    );
    ?>
</div>