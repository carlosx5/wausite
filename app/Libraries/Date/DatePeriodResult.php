<?php

namespace App\Libraries\Date;

/**
 * : Classe para manipulação de períodos de data.
 * 
 * : Esta classe é responsável por calcular a idade a partir de uma data de nascimento
 * : e retornar uma string formatada com anos, meses e dias.
 */
class DatePeriodResult
{
    public function render($dateInit, $dateEnd = null): string

    {
        $dataNascimento = new \DateTime($dateInit);
        $dateEnd = $dateEnd ?? new \DateTime();

        $idade = $dataNascimento->diff($dateEnd);

        $partes = [];

        if ($idade->y > 0) {
            $partes[] = $idade->y . ' ' . ($idade->y == 1 ? 'ano' : 'anos');
        }
        if ($idade->m > 0) {
            $partes[] = $idade->m . ' ' . ($idade->m == 1 ? 'mês' : 'meses');
        }
        if ($idade->d > 0) {
            $partes[] = $idade->d . ' ' . ($idade->d == 1 ? 'dia' : 'dias');
        }

        return implode(' | ', $partes);
    }
}
