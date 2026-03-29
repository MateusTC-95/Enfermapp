<?php
// database.php é a chave da porta
class Database { // definindo a classe

// os atributos privados (so quem ta dentro consegue ver)
    private $host = "sql207.infinityfree.com"; // host do banco
    private $db_name = "if0_41440900_enfermappbd"; // Nome do banco
    private $username = "if0_41440900";          // usuario mysql
    private $password = "Enfermapp123";        // senha
    // variavel que carrega a conexão ativa do BD
    public $conn;

    // a função que realmente conecta
    public function getConnection() {
        $this->conn = null; // limpa outras conexões anteriores pra ter certeza q funciona dboa
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            // Aqui o PHP tenta abrir a porta do banco de dados usando as credenciais q a gente colocou
            $this->conn->exec("set names utf8"); // configuração de acento (garante que nomes com "ç" ou "ã" não fiquem bugados.
        } catch(PDOException $exception) {
            echo "Erro de conexão: " . $exception->getMessage(); // avisa se o server cair (tratamento de erro)
        }
        return $this->conn; // devolve a conexão pronta pra usar nos outros arquivos (Models/Controllers).
    }
}
?>