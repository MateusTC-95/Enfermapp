<?php
require __DIR__ . '/config/database.php';

$sql = file_get_contents(__DIR__ . '/database/schema.sql');

try {
    $pdo->exec($sql);
    echo "✅ Banco configurado com sucesso!";
} catch (PDOException $e) {
    echo "❌ Erro: " . $e->getMessage();
}