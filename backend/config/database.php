<?php
/**
 * Configuración de base de datos
 * Compatible con InfinityFree hosting y localhost
 */

// Configuración para diferentes entornos
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';

if (strpos($host, 'infinityfree') !== false || strpos($host, '.epizy.com') !== false) {
    // Configuración para InfinityFree
    $config = [
        'host' => 'sql200.infinityfree.com', // Cambia según tu hosting
        'dbname' => 'if0_XXXXXXX_birthday_game', // Cambia por tu nombre de BD
        'username' => 'if0_XXXXXXX', // Cambia por tu usuario
        'password' => 'tu_password_aqui', // Cambia por tu password
        'charset' => 'utf8mb4'
    ];
} else {
    // Configuración para localhost
    $config = [
        'host' => 'localhost',
        'dbname' => 'birthday_game',
        'username' => 'root',
        'password' => '',
        'charset' => 'utf8mb4'
    ];
}

try {
    $pdo = new PDO(
        "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}",
        $config['username'],
        $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    // Asegurar que estamos en la base de datos correcta
    $pdo->exec("USE {$config['dbname']}");
} catch (PDOException $e) {
    throw new PDOException($e->getMessage(), (int)$e->getCode());
}

return $pdo;
?>