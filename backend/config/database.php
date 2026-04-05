Aqui está o seu arquivo database.php atualizado com as credenciais do Railway.

Além de trocar os textos, adicionei a variável $port, porque o Railway exige que a porta 3306 esteja explícita na conexão para não dar erro.

PHP
<?php
// database.php - A chave da porta atualizada para o Railway
class Database { 

    // Atributos privados com as novas credenciais do Railway
    private $host = "mysql.railway.internal"; 
    private $db_name = "railway"; 
    private $username = "root"; 
    private $password = "FImhwncVjpHVKugmgiWFuwPEwYVNquKZ"; 
    private $port = "3306"; // Porta padrão do MySQL no Railway
    
    public $conn;

    // A função que realmente conecta
    public function getConnection() {
        $this->conn = null; 

        try {
            // No Railway, precisamos incluir a porta (port) dentro da string de conexão (DSN)
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name, 
                $this->username, 
                $this->password
            );

            // Configuração para garantir que acentos (ç, ã, é) funcionem perfeitamente
            $this->conn->exec("set names utf8"); 
            
            // Ativa o modo de erros para facilitar a nossa vida no Debug do TCC
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        } catch(PDOException $exception) {
            // Se o servidor do Railway cair ou a senha estiver errada, ele avisa aqui
            echo "Erro de conexão: " . $exception->getMessage(); 
        }

        return $this->conn; 
    }
}
?>