<?php

function password_encode($pass)
{
    $caracteres = "abcdefghijklmnopqrstuvxywzABCDEFGHIJKLMNOPQRSTUVXYWZ0123456789";
    $init = '';
    $end = '';
    for ($i = 0; $i < 12; $i++) {
        $init .= substr($caracteres, rand(0, strlen($caracteres) - 1), 1);
        $end .= substr($caracteres, rand(0, strlen($caracteres) - 1), 1);
    }
    return $init . base64url_encode($pass) . $end;
}

function password_decode($code)
{
    $pass = substr($code, 12, -12);
    return base64url_decode($pass);
}

function base64url_encode($data)
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data)
{
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}
