<?php

namespace App\Libraries\Whatsapp;

class Whatsapp
{
    private $idInstances = '';
    private $idToken = '';
    private $logo = '';
    private $title = '';

    /**
     * Método para enviar mensagem
     * @param string $phone
     * @param string $message
     */
    public function sendText($instance, $phone, $message)
    {
        $uri = 'send-text';
        $request = 'POST';
        $url = $this->get_url($instance) . $uri;
        $headers = ["Content-Type: application/json"];
        $post = json_encode([
            "phone" => $phone,
            "message" => $message,
        ]);

        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_CUSTOMREQUEST => $request,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_POSTFIELDS => $post,
        ]);
        $resp = curl_exec($curl);
        curl_close($curl);

        return $resp;
    }

    /**
     * Método para enviar alerta
     * @param string $message
     */
    public function sendAlert($message)
    {
        //ENVIA CONVITE POR ZAP
        // $cel = '5511989497692';//CARLOS
        // $url = "https://arcapp.com.br";
        // $message = $message ? $message : 'SEM MENSAGEM!';
        // $image = "https://arcapp.com.br/img/logos/arc/zap_alert1.jpg";
        // $linkDescription = 'ALERTA!';
        // //
        // $this->sendLink($cel, $message, $url, 0, 0, $image);
        
    }

    public function checkConnected($instance)
    {
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => $this->get_url($instance) . 'status',
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
        ]);
        $resp = json_decode(curl_exec($curl));
        curl_close($curl);

        return $resp->connected;
    }

    public function teste()
    {
        $curl = curl_init();

        curl_setopt_array($curl, array(
          CURLOPT_URL => "https://api.z-api.io/instances/{$this->idInstances}/token/{$this->idToken}/chats?page=10&pageSize=20",
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_ENCODING => "",
          CURLOPT_MAXREDIRS => 10,
          CURLOPT_TIMEOUT => 30,
          CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
          CURLOPT_CUSTOMREQUEST => "GET",
        ));

        $response = curl_exec($curl);
        $err = curl_error($curl);

        curl_close($curl);

        if ($err) {
            echo "cURL Error #:" . $err;
        } else {
            // echo json_encode($response);
            return $response;
        }
    }
}
