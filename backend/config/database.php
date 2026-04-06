<?php
// database.php - Configuração dinâmica para o Railway
class Database { 

    private $host; 
    private $db_name; 
    private $username; 
    private $password; 
    private $port; 
    
    public $conn;

    public function __construct() {
        // Tentamos pegar das variáveis de ambiente do Railway
        // Se não existirem, ele usa os valores que você passou como "fallback"
        $this->host = getenv('MYSQLHOST') ?: "mysql.railway.internal"; 
        $this->db_name = getenv('MYSQLDATABASE') ?: "railway"; 
        $this->username = getenv('MYSQLUSER') ?: "root"; 
        $this->password = getenv('MYSQLPASSWORD') ?: "FImhwncVjpHVKugmgiWFuwPEwYVNquKZ"; 
        $this->port = getenv('MYSQLPORT') ?: "3306";
    }

    public function getConnection() {
        $this->conn = null; 

        try {
            // String de conexão (DSN) usando as variáveis dinâmicas
            $connectionString = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name;
            
            $this->conn = new PDO(
                $connectionString, 
                $this->username, 
                $this->password
            );

            // Garante suporte a acentuação
            $this->conn->exec("set names utf8"); 
            
            // Modo de erro para o Debug do seu TCC
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        } catch(PDOException $exception) {
            // Log do erro para aparecer no "View Logs" do Railway
            error_log("Erro de conexão no Railway: " . $exception->getMessage()); 
            // Opcional: não dar echo em produção para não expor estrutura, mas para TCC ajuda:
            echo json_encode(["erro" => "Falha na conexão com o banco de dados."]);
            exit;
        }

        return $this->conn; 
    }
}
?>