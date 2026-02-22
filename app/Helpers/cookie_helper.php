<?php

/** //:SETA COOKIE
 * @param string $time = 'seconds=86400,days=365'
 *
 * @param string 'seconds=60'   -> 1 minuto
 * @param string 'seconds=600'  -> 10 minutos
 * @param string 'seconds=3600' -> 1 hora
 * @param string 'seconds=43200'-> 12 horas
 * @param string 'seconds=86400'-> 24 horas
 */
function setCook($name, $value, $time = false)
{
    if ($time) {
        $seconds = intval(strArrayFind($time, 'seconds'));
        $days = intval(strArrayFind($time, 'days'));

        if ($seconds) {
            $days = 1;
        } elseif ($days) {
            $seconds = 86400;
        } else {
            $seconds = 86400;
            $days = 365;
        }
    } else {
        $seconds = 86400;
        $days = 365;
    }

    setcookie($name, $value, time() + ($seconds * $days), "/");
}

//:DELETA COOKIE
function delCook($name)
{
    setcookie($name, "", time() - 3600, "/");
}
