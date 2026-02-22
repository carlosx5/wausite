<?php

namespace App\Controllers;

$http_origin = $_SERVER['HTTP_ORIGIN'];
if ($http_origin == "https://api.z-api.io" || $http_origin == "https://arcapp.com.br" || $http_origin == "http://localhost") {
    header("Access-Control-Allow-Origin: $http_origin");
} else {
    $fp = fopen($_SERVER['DOCUMENT_ROOT'] . "/alert_origin.json", "wb");
    fwrite($fp, json_encode('ORIGIN BLOQUEADA: ' . $http_origin));
    fclose($fp);
    dieJson(200, 'erro de origem');
};

header("Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token");
header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');

use CodeIgniter\Controller;
