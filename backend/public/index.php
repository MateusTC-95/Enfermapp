<?php
// o porteiro ne

// caso de erro, o free infinity mostra
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// Config de acesso - permite que o app (q ta em outro lugar) conversa com o PHP
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// inclui a conexão (database) e o model (usuario)
include_once '../config/database.php';
include_once '../models/Usuario.php';

// inicializa o banco e o objeto Usuário
$database = new Database();
$db = $database->getConnection();
$usuario = new Usuario($db);

// pega os dados que o app enviou (no formato JSON)
$data = json_decode(file_get_contents("php://input"));

// verifica se o usuário preencheu tudo
if(!empty($data->nome_usuario) && !empty($data->senha)) {
    
    // passa o nome digitado para o Model procurar
    $usuario->nome_usuario = $data->nome_usuario;
    $stmt = $usuario->login();
    $num = $stmt->rowCount();

    // Se encontrou o usuário...
    if($num > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // compara a senha digitada com a do banco
        if($data->senha == $row['senha']) {
            
            // verifica se a conta não está bloqueada
            if($row['status_conta'] == 'ativa') {
                echo json_encode([
                    "status" => "sucesso",
                    "dados" => [
                        "id" => $row['id_usuario'],
                        "nome" => $row['nome_usuario'],
                        "tipo" => $row['tipo_conta']
                    ]
                ]);
            } else {
                echo json_encode(["status" => "erro", "message" => "Conta " . $row['status_conta']]);
            }

        } else {
            echo json_encode(["status" => "erro", "message" => "Senha incorreta."]);
        }
    } else {
        echo json_encode(["status" => "erro", "message" => "Usuário não encontrado."]);
    }
} else {
    echo json_encode(["status" => "erro", "message" => "Preencha usuário e senha."]);
}
?>