<?php
// models/Usuario.php

class Usuario {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function cadastrar($dados) {
        try {
            // 1. Insere na Tabela 10 (usuario)
            $query = "INSERT INTO usuario (nome_usuario, senha, tipo_conta, cidade, status_conta) 
                      VALUES (:nome, :senha, :tipo, :cidade, 'pendente')";
            
            $stmt = $this->conn->prepare($query);

            // Criptografia simples para o TCC (o hash que aumentamos para 255 chars)
            $senha_hash = password_hash($dados->senha, PASSWORD_BCRYPT);

            $stmt->bindParam(":nome", $dados->nome_usuario);
            $stmt->bindParam(":senha", $senha_hash);
            $stmt->bindParam(":tipo", $dados->tipo_conta);
            $stmt->bindParam(":cidade", $dados->cidade);

            if($stmt->execute()) {
                $id_gerado = $this->conn->lastInsertId();

                // 2. Se for Profissional, insere também na Tabela 7
                if($dados->tipo_conta === 'profissional') {
                    $query_prof = "INSERT INTO profissional (id_usuario, plano, status_aprovacao, avaliacao_media) 
                                   VALUES (:id_u, :plano, 'pendente', 0.0)";
                    $stmt_prof = $this->conn->prepare($query_prof);
                    $stmt_prof->bindParam(":id_u", $id_gerado);
                    $stmt_prof->bindParam(":plano", $dados->plano);
                    $stmt_prof->execute();
                }
                return true;
            }
            return false;
        } catch (PDOException $e) {
            return false;
        }
    }

    // Aproveitando para deixar o Login pronto também
    public function login() {
        $query = "SELECT id_usuario, nome_usuario, senha, tipo_conta, status_conta FROM usuario WHERE nome_usuario = :nome";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":nome", $this->nome_usuario);
        $stmt->execute();
        return $stmt;
    }
}