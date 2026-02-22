<div data-mouseover="false">
    <?php
    $btn = [
        'btnTxt' => 'Tema Rosa',
        'btnIcon' => 'far fa-palette',
        'btnName' => 'btnConfigTheme',
        'btnFather' => 'rosa',
    ];
    echo view('sidebar/templates/buttons/_generic.html', $btn);

    $btn = [
        'btnTxt' => 'Tema Verde',
        'btnIcon' => 'far fa-palette',
        'btnName' => 'btnConfigTheme',
        'btnFather' => 'verde',
    ];
    echo view('sidebar/templates/buttons/_generic.html', $btn);

    $btn = [
        'btnTxt' => 'Tema Azul',
        'btnIcon' => 'far fa-palette',
        'btnName' => 'btnConfigTheme',
        'btnFather' => 'azul',
    ];
    echo view('sidebar/templates/buttons/_generic.html', $btn);

    $btn = [
        'btnTxt' => 'Tema Vinho',
        'btnIcon' => 'far fa-palette',
        'btnName' => 'btnConfigTheme',
        'btnFather' => 'vinho',
    ];
    echo view('sidebar/templates/buttons/_generic.html', $btn);
    ?>
</div>