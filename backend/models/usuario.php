<?php

class Usuario { // define oq o usuario faz relacionado ao BD
    private $conn; // onde guardamos a conexao do database
    private $table_name = "usuario"; // puxou a tabela

    // as coisa da tabela, public pq o index precisa do nome e senha
    public $id_usuario;
    public $nome_usuario; 
    public $senha;
    public $tipo_conta;
    public $status_conta;

    // o sistema cria um novo objeto de usuario, exige que entregue a conexao do banco ($bd) pra ele, sem isso ele nao consulta nada
    public function __construct($db)  {
        $this->conn = $db;
    }

    public function login() {
        // Buscando pelos nomes q a gente definiu
        $query = "SELECT id_usuario, nome_usuario, senha, tipo_conta, status_conta 
                  FROM " . $this->table_name . " 
                  WHERE nome_usuario = ? LIMIT 0,1";

        $stmt = $this->conn->prepare($query); // o banco analise a estrutura antes de receber os dados
        $this->nome_usuario = htmlspecialchars(strip_tags($this->nome_usuario)); //remove qualquer codigo estranho (limpeza de segurança contra script de hacker)
        $stmt->bindParam(1, $this->nome_usuario); // pega o nome q o usuario digitou e manda pro nome usuario
        $stmt->execute(); // oq executa tudo (e o mysql processa a busca)

        return $stmt; // o resultado da pesquisa (q manda pro index)
    }
}
?>