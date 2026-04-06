<?php
// 🔥 SETUP DO BANCO (TEMPORÁRIO)
if (isset($_GET['setup'])) {
    require __DIR__ . '/../setup_database.php';
    exit;
}

// index.php - O Roteador
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';
include_once '../models/Usuario.php';

$database = new Database();
$db = $database->getConnection();
$usuario = new Usuario($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->acao)) {
    
    // AÇÃO DE LOGIN
    if($data->acao == "login") {
        // ... (aquele código de login que você já tem)
    }

    // AÇÃO DE CADASTRO
    if($data->acao == "cadastrar") {
        if($usuario->cadastrar($data)) {
            echo json_encode([
                "status" => "sucesso",
                "message" => "Usuário criado com sucesso!"
            ]);
        } else {
            echo json_encode([
                "status" => "erro",
                "message" => "Erro ao salvar no banco. Nome de usuário já existe?"
            ]);
        }
    }

} else {
    echo json_encode([
        "status" => "erro",
        "message" => "Nenhuma acao definida."
    ]);
}