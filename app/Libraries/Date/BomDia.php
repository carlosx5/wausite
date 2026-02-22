<?php

namespace App\Libraries\Date;

/**
 * : Classe para manipulação de períodos de data.
 * 
 * : Esta classe é responsável por calcular a idade a partir de uma data de nascimento
 * : e retornar uma string formatada com anos, meses e dias.
 */
class BomDia
{
    public static function render(): string
    {
        $hour = date('H');

        if ($hour < 5) {
            return "Boa noite";
        } elseif ($hour < 12) {
            return "Bom dia";
        } elseif ($hour < 18) {
            return "Boa tarde";
        }

        return "Boa noite";
    }
}
