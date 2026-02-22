<?php

function sendEmail($to, $subject, $message)
{
    $email = \Config\Services::email();

    $initialize = array(
        'protocol' => 'smtp',
        'SMTPHost' => 'smtp.hostinger.com',
        'SMTPPort' => 465,
        'SMTPCrypto' => 'ssl', //USADO APENAS PARA PORTA 465
        'SMTPUser' => 'nao-responda@wausaude.com.br',
        'SMTPPass' => 'Wacar@654',
        'mailType' => 'html',
        'charset' => 'utf-8',
        'newline' => "\r\n",
        'CRLF'    => "\r\n",
        'SMTPTimeout' => 30,
    );

    $email->initialize($initialize);
    $email->setFrom('nao-responda@wausaude.com.br');
    $email->setTo($to);
    $email->setSubject($subject);
    $email->setMessage($message);

    if ($email->send()) {
        return 1;
    } else {
        // show_error($this->email->print_debugger());
        return $email->printDebugger();
    };
}
