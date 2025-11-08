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
            PDO::ATTR_PERSISTENT => true,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$config['charset']}"
        ]
    );

    // Asegurar que estamos en la base de datos correcta
    $pdo->exec("USE {$config['dbname']}");

    // Configurar timeouts para evitar desconexiones
    $pdo->exec('SET SESSION wait_timeout = 28800');
    $pdo->exec('SET SESSION interactive_timeout = 28800');
    $pdo->exec('SET SESSION net_read_timeout = 28800');
    $pdo->exec('SET SESSION net_write_timeout = 28800');
    // Nota: max_allowed_packet requiere permisos GLOBAL, omitido para localhost

    // Verificar que la tabla player_messages existe, si no, crearla
    try {
        $stmt = $pdo->query("SELECT 1 FROM player_messages LIMIT 1");
    } catch (PDOException $e) {
        // Crear tabla si no existe
        $pdo->exec("CREATE TABLE IF NOT EXISTS player_messages (
            id int(11) NOT NULL AUTO_INCREMENT,
            room_id int(11) NOT NULL,
            player_id int(11) NOT NULL,
            message text NOT NULL,
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY room_id (room_id),
            KEY player_id (player_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    }
} catch (PDOException $e) {
    throw new PDOException($e->getMessage(), (int)$e->getCode());
}

return $pdo;
?>