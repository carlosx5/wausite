<!DOCTYPE html>
<html lang="pt-br">

<head>

    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>WAU Saúde</title>
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:url" content="https://wausaude.com.br/" />
    <meta property="og:title" content="WauSaúde" />
    <meta property="og:site_name" content="WauSaúde" />
    <meta property="og:description" content="WauSaúde - Sistemas Integrados" />
    <meta property="og:image" content="https://wausaude.com.br/dataSistem/images/wau_social01.jpg" />
    <meta property="og:image:type" content="image/jpg" />
    <meta property="og:image:width" content="600" />
    <meta property="og:image:height" content="315" />
    <meta property="og:type" content="website" />

    <meta name="theme-color" content="#4e4e4e">
    <meta name="apple-mobile-web-app-status-bar-style" content="#4e4e4e">
    <meta name="msapplication-navbutton-color" content="#4e4e4e">

    <link rel="apple-touch-icon" sizes="180x180" href="<?= base_url('img/favicon/apple-touch-icon.png') ?>">
    <link rel="icon" type="image/png" sizes="32x32" href="<?= base_url('img/favicon/favicon-32x32.png') ?>">
    <link rel="icon" type="image/png" sizes="16x16" href="<?= base_url('img/favicon/favicon-16x16.png') ?>">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-LN+7fdVzj6u52u30Kp6M/trliBMCMKTyK833zpbD+pXdCLuTusPj697FH4R/5mcr" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <?php
    if (isset($css)) {
        foreach ($css as $c) {
            echo ("<link rel=\"stylesheet\" href=\"" . base_url($c) . "\">\n");
        }
    }
    ?>

</head>