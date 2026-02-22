<?php

namespace App\Controllers\User\Register;

use App\Controllers\BaseController;
use App\Models\User\User_register_Model;

class UserSignature extends BaseController
{
    public $modUser;

    public function __construct()
    {
        $this->modUser = new User_register_Model();
    }

    public function index()
    {
        $uri = $this->initBackend(9);

        session()->setFlashdata('sidebar', [
            'menuActive' => 'Usuários',
            'viewTitle' => 'Cadastro de Usuários',
            'contenList' => ['user/register/sidebar'],
        ]);

        $data = $this->dataCreate(
            "p-cropper.v162,{$uri}",
            "p-cropper.v162,{$uri}",
            'user_signature'
        );

        $data['varJS']['callback'] = 'user/register/userSignature/setImage';

        return viewShow($uri, $data);
    }

    public function setImage()
    {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['image']))//:Se não tiver imagem
            return $this->json(200, 'Imagem não enviada');

        $image = $data['image'];//:Pega imagem

        if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
            $image = substr($image, strpos($image, ',') + 1);
            $type = strtolower($type[1]);

            if (!in_array($type, ['jpg', 'jpeg', 'png']))//:Valida tipo
                return $this->json(200, 'Tipo de imagem inválido');

            $image = base64_decode($image);//:Decodifica imagem
            if ($image === false)
                return $this->json(200, 'Erro ao decodificar imagem');

            $filename = 'upload_' . uniqid() . '.' . $type;//:Nome do arquivo
            $folder = FCPATH . 'data/userSignature';//:Caminho da pasta

            if (!is_dir($folder))//:Se pasta não existir, cria...
                mkdir($folder, 0755, true);

            $path = "$folder/$filename";//:Caminho + nome

            if (file_put_contents($path, $image))//:Salva imagem na pasta
                return $this->json(200, $filename);

            return $this->json(200, 'Erro ao salvar arquivo');
        } else {
            return $this->json(200, 'Formato inválido');
        }
    }
}