<?php
/**
 * API Principal para el juego de cumpleaños multijugador
 */

require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../classes/GameRoom.php';
require_once '../classes/Rating.php';
require_once '../classes/Notification.php';

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
                $input['timeLimitHours'] ?? 72
            );
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
            
        // === RUTAS DE CALIFICACIONES ===
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

echo json_encode($result);
?>