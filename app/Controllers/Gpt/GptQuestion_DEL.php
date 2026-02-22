<?php

namespace App\Controllers\Gpt;

use App\Controllers\BaseController;
use App\Libraries\Curl\CurlGpt;
use App\Models\Gpt\Gpt_Model;

class GptQuestion extends BaseController
{
    private $libGpt;
    private $modGpt;

    public function __construct()
    {
        $this->libGpt = new CurlGpt();
        $this->modGpt = new Gpt_Model();
    }

    /** //+BUSCA RESPOSTA */
    public function getReply()
    {
        $this->initFetch(169);

        $userQuestion = $this->request->getVar('userQuestion');
        $userQuestion = removeSpecialChars($userQuestion);

        //:REMOVE SESSION
        // session()->remove('gpt');

        //:VERIFICA INTERESSE NA SESSION
        $userInterest = isset(session()->gpt['interest']) ? session()->gpt['interest'] : '';

        //:VERIFICA INTERESSE EM MASTOPEXIA
        $resp = $this->userInterest(
            $userQuestion,
            ['masto|maxto'],
            'mastopexia'
        );
        $userInterest = strArray($userInterest, $resp, 'returnAs=2');

        //:VERIFICA INTERESSE EM RINOPLASTIA
        $resp = $this->userInterest(
            $userQuestion,
            ['rino'],
            'rinoplastia'
        );
        $userInterest = strArray($userInterest, $resp, 'returnAs=2');

        //:VERIFICA INTERESSE EM MAMOPLASTIA
        $resp = $this->userInterest(
            $userQuestion,
            ['protese|mama|mamop'],
            'mamoplastia'
        );
        $userInterest = strArray($userInterest, $resp, 'returnAs=2');

        //:VERIFICA INTERESSE EM LIPO
        $resp = $this->userInterest(
            $userQuestion,
            ['lipo|hd|papada'],
            'lipoaspiracao'
        );
        $userInterest = strArray($userInterest, $resp, 'returnAs=2');

        //:VERIFICA INTERESSE EM ULTRAFORMER
        $resp = $this->userInterest(
            $userQuestion,
            ['ultra'],
            'ultraformer'
        );
        $userInterest = strArray($userInterest, $resp, 'returnAs=2');

        //:VERIFICA INTERESSE EM LAVIEEN
        $resp = $this->userInterest(
            $userQuestion,
            ['lavi'],
            'lavieen'
        );
        $userInterest = strArray($userInterest, $resp, 'returnAs=2');

        //:VERIFICA INTERESSE EM BOTOX
        $resp = $this->userInterest(
            $userQuestion,
            ['botox'],
            'botox'
        );
        $userInterest = strArray($userInterest, $resp, 'returnAs=2');

        //:VERIFICA INTERESSE EM HARMONIZACAO
        $resp = $this->userInterest(
            $userQuestion,
            ['armo'],
            'harmonizacao'
        );
        $userInterest = strArray($userInterest, $resp, 'returnAs=2');

        //:BUSCA VALORES NA SESSION
        $sess_question1 = isset(session()->gpt['question1']) ? session()->gpt['question1'] : '';
        $sess_question2 = isset(session()->gpt['question2']) ? session()->gpt['question2'] : '';
        $sess_interest = isset(session()->gpt['interest']) ? session()->gpt['interest'] : '';
        // dj(session()->get());

        //:FINALIZA INTERESSE DO USUÁRIO
        $userInterest ??= $sess_interest;

        //:ATUALIZA SESSION
        $gptNew = [
            'gpt' => [
                'question1' => $userQuestion,
                'question2' => $sess_question1,
                'interest' => $userInterest,
            ]
        ];
        session()->set($gptNew);
        // dj(session()->get());

        //:BUSCA CONTEUDO NO BD
        $contentToSearch = $this->modGpt->find(1)->content;
        $contentToSearch .= "\n\nPerguntas que o usuário fez anteriormente para te ajudar na resposta:";
        $contentToSearch .= "\n{$gptNew['gpt']['question1']}";
        $contentToSearch .= "\n{$gptNew['gpt']['question2']}";
        if ($userInterest)
            $contentToSearch .= "\n\nUsuário tem interesse em $userInterest.";
        // dj($contentToSearch);

        //:BUSCA RESPOSTA NO CHATGPT
        $data['response'] = $this->libGpt->sendCurl($userQuestion, $contentToSearch);
        $data['question'] = $userQuestion;
        $data['question1'] = $sess_question1;
        $data['question2'] = $sess_question2;
        $data['interest'] = session()->gpt['interest'];

        return $this->json(200, $data);
    }

    /** //-VERIFICA INTERESSE DO USUÁRIO
     * @param mixed $userQuestion
     * @param mixed $compare
     * @param mixed $interest
     */
    public function userInterest($userQuestion, $compare, $interest)
    {
        //:PASSA P/ MINUSCULO
        $userQuestion = strtolower($userQuestion);

        //:REMOVE ACENTUAÇÃO E CARACTERES
        $userQuestion = removeSpecialChars($userQuestion);

        //:COMPARA
        foreach ($compare as $value) {
            $exists = null;
            $value = strtolower($value);
            $value = explode('|', $value);

            foreach ($value as $val) {
                //:REMOVE ACENTUAÇÃO E CARACTERES
                $val = removeSpecialChars($val);

                $ok = strpos(
                    $userQuestion,
                    $val
                ) !== false;

                if ($ok)
                    $exists = true;
            }

            if (!$exists)
                return null;
        }

        return $interest;
    }

    /** //+DELETA INTERESSE DA SESSION */
    public function delInterest()
    {
        session()->set([
            'gpt' => [
                'question1' => '',
                'question2' => '',
                'interest' => '',
            ]
        ]);

        $data['gpt'] = session()->gpt;

        return $this->json(200, $data);
    }
}