<?php
/**
 * API Principal para el juego de cumpleaños multijugador
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../classes/GameRoom.php';
require_once '../classes/Rating.php';
require_once '../classes/Notification.php';

// Evitar output HTML de errores PHP
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Obtener método HTTP y ruta
$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['path'] ?? '';
$input = json_decode(file_get_contents('php://input'), true) ?? [];

// Inicializar clases
try {
    $gameRoom = new GameRoom($pdo);
    $rating = new Rating($pdo);
    $notification = new Notification($pdo);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error de conexión a la base de datos']);
    exit;
}

// Enrutador simple
try {
    switch ($path) {
        // === RUTAS DE SALAS ===
        case 'rooms/create':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }
            $result = $gameRoom->createRoom(
                $input['playerName'] ?? '',
                $input['profilePhoto'] ?? null,
                $input['deadlineDateTime'] ?? null
            );
            break;

        case 'upload/profile-photo':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }

            // Crear directorio si no existe
            $uploadDir = '../uploads/profile-photos/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            if (!isset($_FILES['photo'])) {
                $result = ['success' => false, 'error' => 'No se recibió ninguna imagen'];
                break;
            }

            $file = $_FILES['photo'];

            // Validar tipo de archivo
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($file['type'], $allowedTypes)) {
                $result = ['success' => false, 'error' => 'Tipo de archivo no permitido. Solo imágenes JPG, PNG, GIF o WebP.'];
                break;
            }

            // Validar tamaño (máximo 5MB)
            if ($file['size'] > 5 * 1024 * 1024) {
                $result = ['success' => false, 'error' => 'La imagen es demasiado grande. Máximo 5MB.'];
                break;
            }

            // Generar nombre único para el archivo
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $fileName = uniqid('profile_', true) . '.' . $extension;
            $filePath = $uploadDir . $fileName;

            // Mover archivo
            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                $result = [
                    'success' => true,
                    'data' => [
                        'photo_url' => $fileName,
                        'file_path' => $filePath
                    ]
                ];
            } else {
                $result = ['success' => false, 'error' => 'Error al guardar la imagen'];
            }
            break;
            
        case 'rooms/join':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }
            $result = $gameRoom->joinRoom(
                $input['roomCode'] ?? '',
                $input['playerName'] ?? '',
                $input['profilePhoto'] ?? null
            );
            break;
            
        case 'rooms/start':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }
            $result = $gameRoom->startGame(
                $input['roomId'] ?? 0,
                $input['playerId'] ?? 0
            );
            break;
            
        case 'rooms/info':
            if ($method !== 'GET') {
                throw new Exception('Método no permitido');
            }
            $result = $gameRoom->getRoomInfo($_GET['roomId'] ?? 0);
            break;
            
        case 'rooms/available':
            if ($method !== 'GET') {
                throw new Exception('Método no permitido');
            }
            $result = $gameRoom->getAvailableRooms();
            break;

        case 'rooms/update-deadline':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }
            $result = $gameRoom->updateDeadline(
                $input['roomId'] ?? 0,
                $input['playerId'] ?? 0,
                $input['newDeadline'] ?? ''
            );
            break;
            
        // === RUTAS DE CALIFICACIONES ===
        case 'ratings/player':
            if ($method !== 'GET') {
                throw new Exception('Método no permitido');
            }
            $result = $rating->getPlayerRatings($_GET['roomId'] ?? 0, $_GET['playerId'] ?? 0);
            break;

        case 'ratings/save':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }
            $result = $rating->saveRating(
                $input['roomId'] ?? 0,
                $input['playerId'] ?? 0,
                $input['messageId'] ?? 0,
                $input['rating'] ?? 0,
                $input['comment'] ?? null
            );
            break;
            
        case 'ratings/finish':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }
            $result = $rating->markPlayerFinished(
                $input['roomId'] ?? 0,
                $input['playerId'] ?? 0
            );
            break;
            
        case 'ratings/results':
            if ($method !== 'GET') {
                throw new Exception('Método no permitido');
            }
            $result = $rating->calculateResults($_GET['roomId'] ?? 0);
            break;
            
        // === RUTAS DE NOTIFICACIONES ===
        case 'notifications/room':
            if ($method !== 'GET') {
                throw new Exception('Método no permitido');
            }
            $result = $notification->getRoomNotifications(
                $_GET['roomId'] ?? 0,
                $_GET['limit'] ?? 50
            );
            break;
            
        case 'notifications/unread':
            if ($method !== 'GET') {
                throw new Exception('Método no permitido');
            }
            $result = $notification->getUnreadNotifications(
                $_GET['roomId'] ?? 0,
                $_GET['since'] ?? null
            );
            break;
            
        // === RUTAS DE MENSAJES ===
        case 'messages':
            if ($method !== 'GET') {
                throw new Exception('Método no permitido');
            }
            $stmt = $pdo->prepare("
                SELECT friend_id as id, name, message, color_class, icon_name, photo_url
                FROM congratulation_messages
                ORDER BY friend_id
            ");
            $stmt->execute();
            $messages = $stmt->fetchAll();
            $result = ['success' => true, 'data' => $messages];
            break;

        // === RUTAS DE MENSAJES DE JUGADORES ===
        case 'player-messages/save':
            if ($method !== 'POST') {
                throw new Exception('Método no permitido');
            }
            try {
                // Crear tabla si no existe
                $pdo->exec("CREATE TABLE IF NOT EXISTS player_messages (
                    id int(11) NOT NULL AUTO_INCREMENT,
                    room_id int(11) NOT NULL,
                    player_id int(11) NOT NULL,
                    message text NOT NULL,
                    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    KEY room_id (room_id),
                    KEY player_id (player_id),
                    FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
                    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

                // Verificar que el jugador no haya enviado ya un mensaje en esta sala
                $stmt = $pdo->prepare("
                    SELECT id FROM player_messages
                    WHERE room_id = ? AND player_id = ?
                ");
                $stmt->execute([
                    $input['roomId'] ?? 0,
                    $input['playerId'] ?? 0
                ]);

                if ($stmt->fetch()) {
                    $result = ['success' => false, 'error' => 'Ya has enviado un mensaje en esta sala.'];
                    break;
                }

                $stmt = $pdo->prepare("
                    INSERT INTO player_messages (room_id, player_id, message)
                    VALUES (?, ?, ?)
                ");
                $stmt->execute([
                    $input['roomId'] ?? 0,
                    $input['playerId'] ?? 0,
                    $input['message'] ?? ''
                ]);
                $result = ['success' => true, 'message' => 'Mensaje guardado correctamente'];
            } catch (Exception $e) {
                $result = ['success' => false, 'error' => $e->getMessage()];
            }
            break;

        case 'player-messages/get':
            if ($method !== 'GET') {
                throw new Exception('Método no permitido');
            }
            try {
                // Crear tabla si no existe
                $pdo->exec("CREATE TABLE IF NOT EXISTS player_messages (
                    id int(11) NOT NULL AUTO_INCREMENT,
                    room_id int(11) NOT NULL,
                    player_id int(11) NOT NULL,
                    message text NOT NULL,
                    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    KEY room_id (room_id),
                    KEY player_id (player_id),
                    FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
                    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

                $stmt = $pdo->prepare("
                    SELECT pm.id, pm.message, pm.created_at, p.name as player_name, p.profile_photo
                    FROM player_messages pm
                    JOIN players p ON pm.player_id = p.id
                    WHERE pm.room_id = ?
                    ORDER BY pm.created_at
                ");
                $stmt->execute([$_GET['roomId'] ?? 0]);
                $messages = $stmt->fetchAll();
                $result = ['success' => true, 'data' => $messages];
            } catch (Exception $e) {
                $result = ['success' => false, 'error' => $e->getMessage()];
            }
            break;
            
        // === RUTAS DE ESTADO ===
        case 'status':
            if ($method !== 'GET') {
                throw new Exception('Método no permitido');
            }
            $result = ['success' => true, 'status' => 'API funcionando correctamente'];
            break;
            
        default:
            http_response_code(404);
            $result = ['success' => false, 'error' => 'Endpoint no encontrado'];
            break;
    }
    
} catch (Exception $e) {
    http_response_code(400);
    $result = ['success' => false, 'error' => $e->getMessage()];
}

// Asegurar que solo se envía JSON
if (!headers_sent()) {
    header('Content-Type: application/json');
}

echo json_encode($result);
?>