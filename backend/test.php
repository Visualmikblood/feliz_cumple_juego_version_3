<?php
/**
 * Script de pruebas para verificar que todo funciona correctamente
 */

require_once 'config/cors.php';
require_once 'config/database.php';
require_once 'classes/GameRoom.php';
require_once 'classes/Rating.php';
require_once 'classes/Notification.php';

header('Content-Type: application/json');

$tests = [];
$passed = 0;
$failed = 0;

// Test 1: Conexión a base de datos
try {
    $stmt = $pdo->query("SELECT 1");
    $tests[] = ['name' => 'Conexión a base de datos', 'status' => 'PASS', 'message' => 'Conexión exitosa'];
    $passed++;
} catch (Exception $e) {
    $tests[] = ['name' => 'Conexión a base de datos', 'status' => 'FAIL', 'message' => $e->getMessage()];
    $failed++;
}

// Test 2: Verificar tablas existen
$requiredTables = ['game_rooms', 'players', 'congratulation_messages', 'ratings', 'notifications'];
foreach ($requiredTables as $table) {
    try {
        $stmt = $pdo->query("SELECT 1 FROM {$table} LIMIT 1");
        $tests[] = ['name' => "Tabla {$table}", 'status' => 'PASS', 'message' => 'Tabla existe'];
        $passed++;
    } catch (Exception $e) {
        // Intentar crear la tabla si no existe
        try {
            switch ($table) {
                case 'game_rooms':
                    $pdo->exec('CREATE TABLE game_rooms (
                        id int(11) NOT NULL AUTO_INCREMENT,
                        room_code varchar(8) NOT NULL,
                        host_player_id int(11) DEFAULT NULL,
                        status enum("waiting","playing","finished","expired") DEFAULT "waiting",
                        time_limit_hours int(11) DEFAULT 72,
                        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        started_at timestamp NULL DEFAULT NULL,
                        expires_at timestamp NULL DEFAULT NULL,
                        finished_at timestamp NULL DEFAULT NULL,
                        PRIMARY KEY (id),
                        UNIQUE KEY room_code (room_code),
                        KEY status (status),
                        KEY expires_at (expires_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');
                    break;
                case 'players':
                    $pdo->exec('CREATE TABLE players (
                        id int(11) NOT NULL AUTO_INCREMENT,
                        room_id int(11) NOT NULL,
                        name varchar(100) NOT NULL,
                        profile_photo varchar(255) DEFAULT NULL,
                        is_host tinyint(1) DEFAULT 0,
                        is_ready tinyint(1) DEFAULT 0,
                        has_finished_rating tinyint(1) DEFAULT 0,
                        session_id varchar(64) NOT NULL,
                        joined_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        finished_rating_at timestamp NULL DEFAULT NULL,
                        PRIMARY KEY (id),
                        KEY room_id (room_id),
                        KEY session_id (session_id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');
                    break;
                case 'ratings':
                    $pdo->exec('CREATE TABLE ratings (
                        id int(11) NOT NULL AUTO_INCREMENT,
                        room_id int(11) NOT NULL,
                        player_id int(11) NOT NULL,
                        message_id int(11) NOT NULL,
                        rating int(11) NOT NULL,
                        comment text DEFAULT NULL,
                        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (id),
                        UNIQUE KEY unique_rating (room_id,player_id,message_id),
                        KEY room_id (room_id),
                        KEY player_id (player_id),
                        KEY message_id (message_id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');
                    break;
                case 'notifications':
                    $pdo->exec('CREATE TABLE notifications (
                        id int(11) NOT NULL AUTO_INCREMENT,
                        room_id int(11) NOT NULL,
                        type enum("room_created","player_joined","game_started","one_day_left","room_closed","player_finished") NOT NULL,
                        message text NOT NULL,
                        data json DEFAULT NULL,
                        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        is_sent tinyint(1) DEFAULT 0,
                        PRIMARY KEY (id),
                        KEY room_id (room_id),
                        KEY type (type),
                        KEY created_at (created_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');
                    break;
                case 'congratulation_messages':
                    $pdo->exec('CREATE TABLE congratulation_messages (
                        id int(11) NOT NULL AUTO_INCREMENT,
                        friend_id int(11) NOT NULL,
                        name varchar(100) NOT NULL,
                        message text NOT NULL,
                        color_class varchar(50) NOT NULL,
                        icon_name varchar(50) NOT NULL,
                        photo_url varchar(255) DEFAULT NULL,
                        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (id),
                        UNIQUE KEY friend_id (friend_id)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');
                    $pdo->exec("INSERT IGNORE INTO congratulation_messages (friend_id, name, message, color_class, icon_name, photo_url) VALUES
                    (1, 'María', '¡Feliz cumpleaños! Eres una persona increíble...', 'bg-pink-400', 'Heart', '/photos/maria.jpg'),
                    (2, 'Carlos', '¡Hey cumpleañero/a! Espero que tengas un día fantástico...', 'bg-blue-400', 'Gift', '/photos/carlos.jpg'),
                    (3, 'Ana', '¡Felicidades en tu día especial! Eres una de las personas más divertidas...', 'bg-green-400', 'Star', '/photos/ana.jpg'),
                    (4, 'Pedro', '¡Cumpleaños feliz! Me alegra mucho poder celebrar contigo...', 'bg-yellow-400', 'PartyPopper', '/photos/pedro.jpg'),
                    (5, 'Laura', '¡Feliz cumple! Gracias por ser tan buena persona...', 'bg-purple-400', 'Sparkles', '/photos/laura.jpg'),
                    (6, 'Diego', '¡Qué tengas un cumpleaños espectacular! Eres una persona única...', 'bg-red-400', 'Cake', '/photos/diego.jpg'),
                    (7, 'Sofia', '¡Feliz cumpleaños querido/a! Tu amistad significa mucho para mí...', 'bg-indigo-400', 'Heart', '/photos/sofia.jpg'),
                    (8, 'Miguel', '¡Cumpleaños feliz! Espero que tu día esté lleno de sorpresas...', 'bg-orange-400', 'Gift', '/photos/miguel.jpg'),
                    (9, 'Carmen', '¡Feliz cumple! Eres una persona extraordinaria...', 'bg-teal-400', 'Star', '/photos/carmen.jpg'),
                    (10, 'Javier', '¡Felicidades! Otro año más de vida para celebrar...', 'bg-cyan-400', 'PartyPopper', '/photos/javier.jpg'),
                    (11, 'Isabel', '¡Feliz cumpleaños! Eres una persona muy especial...', 'bg-rose-400', 'Sparkles', '/photos/isabel.jpg');");
                    break;
            }
            $tests[] = ['name' => "Tabla {$table}", 'status' => 'PASS', 'message' => 'Tabla creada exitosamente'];
            $passed++;
        } catch (Exception $e2) {
            $tests[] = ['name' => "Tabla {$table}", 'status' => 'FAIL', 'message' => 'Error al crear tabla: ' . $e2->getMessage()];
            $failed++;
        }
    }
}

// Test 3: Verificar datos iniciales
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM congratulation_messages");
    $count = $stmt->fetch()['count'];
    if ($count >= 11) {
        $tests[] = ['name' => 'Mensajes de felicitaciones', 'status' => 'PASS', 'message' => "{$count} mensajes encontrados"];
        $passed++;
    } else {
        $tests[] = ['name' => 'Mensajes de felicitaciones', 'status' => 'FAIL', 'message' => "Solo {$count} mensajes, se esperaban 11"];
        $failed++;
    }
} catch (Exception $e) {
    $tests[] = ['name' => 'Mensajes de felicitaciones', 'status' => 'FAIL', 'message' => $e->getMessage()];
    $failed++;
}

// Test 4: Probar clases principales
try {
    $gameRoom = new GameRoom($pdo);
    $rating = new Rating($pdo);
    $notification = new Notification($pdo);
    $tests[] = ['name' => 'Clases PHP', 'status' => 'PASS', 'message' => 'Todas las clases se cargan correctamente'];
    $passed++;
} catch (Exception $e) {
    $tests[] = ['name' => 'Clases PHP', 'status' => 'FAIL', 'message' => $e->getMessage()];
    $failed++;
}

// Test 5: Crear y eliminar sala de prueba
try {
    $gameRoom = new GameRoom($pdo);
    $result = $gameRoom->createRoom('Test Player', null, 1); // 1 hora para que expire pronto
    
    if ($result['success']) {
        $roomId = $result['data']['room_id'];
        
        // Limpiar sala de prueba
        $stmt = $pdo->prepare("DELETE FROM game_rooms WHERE id = ?");
        $stmt->execute([$roomId]);
        
        $tests[] = ['name' => 'Crear/eliminar sala', 'status' => 'PASS', 'message' => 'Sala creada y eliminada exitosamente'];
        $passed++;
    } else {
        $tests[] = ['name' => 'Crear/eliminar sala', 'status' => 'FAIL', 'message' => $result['error']];
        $failed++;
    }
} catch (Exception $e) {
    $tests[] = ['name' => 'Crear/eliminar sala', 'status' => 'FAIL', 'message' => $e->getMessage()];
    $failed++;
}

// Test 6: Verificar configuración de PHP
$requiredExtensions = ['pdo', 'pdo_mysql', 'json'];
foreach ($requiredExtensions as $ext) {
    if (extension_loaded($ext)) {
        $tests[] = ['name' => "Extensión PHP {$ext}", 'status' => 'PASS', 'message' => 'Extensión disponible'];
        $passed++;
    } else {
        $tests[] = ['name' => "Extensión PHP {$ext}", 'status' => 'FAIL', 'message' => 'Extensión no disponible'];
        $failed++;
    }
}

// Test 7: Verificar permisos de escritura (si aplica)
if (is_writable(__DIR__)) {
    $tests[] = ['name' => 'Permisos de escritura', 'status' => 'PASS', 'message' => 'Directorio escribible'];
    $passed++;
} else {
    $tests[] = ['name' => 'Permisos de escritura', 'status' => 'WARN', 'message' => 'Directorio no escribible (puede afectar logs)'];
}

// Resultado final
$result = [
    'success' => $failed === 0,
    'summary' => [
        'total' => count($tests),
        'passed' => $passed,
        'failed' => $failed
    ],
    'tests' => $tests,
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => PHP_VERSION,
    'server_info' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
];

echo json_encode($result, JSON_PRETTY_PRINT);
?>