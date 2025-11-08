<?php
/**
 * Clase para manejar las salas de juego
 */

class GameRoom {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * Crear una nueva sala de juego
     */
    public function createRoom($hostName, $profilePhoto = null, $timeLimitHours = 72) {
        try {
            $this->pdo->beginTransaction();
            
            // Generar código único para la sala
            $roomCode = $this->generateUniqueRoomCode();
            
            // Crear la sala
            $stmt = $this->pdo->prepare("
                INSERT INTO game_rooms (room_code, time_limit_hours, created_at, expires_at) 
                VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? HOUR))
            ");
            $stmt->execute([$roomCode, $timeLimitHours, $timeLimitHours]);
            $roomId = $this->pdo->lastInsertId();
            
            // Crear sesión para el host
            $sessionId = $this->generateSessionId();
            
            // Agregar el host como jugador
            $stmt = $this->pdo->prepare("
                INSERT INTO players (room_id, name, profile_photo, is_host, is_ready, session_id)
                VALUES (?, ?, ?, 1, 1, ?)
            ");
            $stmt->execute([$roomId, $hostName, $profilePhoto ?: null, $sessionId]);
            $hostPlayerId = $this->pdo->lastInsertId();
            
            // Actualizar la sala con el ID del host
            $stmt = $this->pdo->prepare("UPDATE game_rooms SET host_player_id = ? WHERE id = ?");
            $stmt->execute([$hostPlayerId, $roomId]);
            
            // Crear notificación de sala creada
            $this->createNotification($roomId, 'room_created', "Sala $roomCode creada por $hostName", [
                'room_code' => $roomCode,
                'host_name' => $hostName,
                'time_limit_hours' => $timeLimitHours
            ]);
            
            $this->pdo->commit();
            
            return [
                'success' => true,
                'data' => [
                    'room_id' => $roomId,
                    'room_code' => $roomCode,
                    'player_id' => $hostPlayerId,
                    'session_id' => $sessionId,
                    'expires_at' => date('Y-m-d H:i:s', strtotime("+{$timeLimitHours} hours"))
                ]
            ];
            
        } catch (Exception $e) {
            $this->pdo->rollback();
            return ['success' => false, 'error' => 'Error al crear la sala: ' . $e->getMessage()];
        }
    }
    
    /**
     * Unirse a una sala existente
     */
    public function joinRoom($roomCode, $playerName, $profilePhoto = null) {
        try {
            // Verificar que la sala existe y está disponible
            $stmt = $this->pdo->prepare("
                SELECT id, status, expires_at 
                FROM game_rooms 
                WHERE room_code = ? AND status IN ('waiting', 'playing')
            ");
            $stmt->execute([$roomCode]);
            $room = $stmt->fetch();
            
            if (!$room) {
                return ['success' => false, 'error' => 'Sala no encontrada o no disponible'];
            }
            
            // Verificar que no ha expirado
            if (strtotime($room['expires_at']) < time()) {
                return ['success' => false, 'error' => 'La sala ha expirado'];
            }
            
            // Verificar que el jugador no esté ya en la sala
            $stmt = $this->pdo->prepare("
                SELECT id FROM players 
                WHERE room_id = ? AND name = ?
            ");
            $stmt->execute([$room['id'], $playerName]);
            if ($stmt->fetch()) {
                return ['success' => false, 'error' => 'Ya existe un jugador con ese nombre en la sala'];
            }
            
            $sessionId = $this->generateSessionId();
            
            // Agregar el jugador
            $stmt = $this->pdo->prepare("
                INSERT INTO players (room_id, name, profile_photo, session_id)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$room['id'], $playerName, $profilePhoto ?: null, $sessionId]);
            $playerId = $this->pdo->lastInsertId();
            
            // Crear notificación de jugador unido
            $this->createNotification($room['id'], 'player_joined', "$playerName se ha unido a la sala", [
                'player_name' => $playerName,
                'player_id' => $playerId
            ]);
            
            return [
                'success' => true,
                'data' => [
                    'room_id' => $room['id'],
                    'player_id' => $playerId,
                    'session_id' => $sessionId,
                    'status' => $room['status']
                ]
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al unirse a la sala: ' . $e->getMessage()];
        }
    }
    
    /**
     * Iniciar el juego (solo el host puede hacerlo)
     */
    public function startGame($roomId, $playerId) {
        try {
            // Verificar que el jugador es el host
            $stmt = $this->pdo->prepare("
                SELECT p.is_host, r.status 
                FROM players p 
                JOIN game_rooms r ON p.room_id = r.id 
                WHERE p.id = ? AND p.room_id = ?
            ");
            $stmt->execute([$playerId, $roomId]);
            $player = $stmt->fetch();
            
            if (!$player) {
                return ['success' => false, 'error' => 'Jugador no encontrado'];
            }
            
            if (!$player['is_host']) {
                return ['success' => false, 'error' => 'Solo el host puede iniciar el juego'];
            }
            
            if ($player['status'] !== 'waiting') {
                return ['success' => false, 'error' => 'El juego ya ha comenzado o finalizado'];
            }
            
            // Verificar que hay al menos 2 jugadores
            $stmt = $this->pdo->prepare("SELECT COUNT(*) as count FROM players WHERE room_id = ?");
            $stmt->execute([$roomId]);
            $playerCount = $stmt->fetch()['count'];
            
            if ($playerCount < 2) {
                return ['success' => false, 'error' => 'Se necesitan al menos 2 jugadores para empezar'];
            }
            
            // Iniciar el juego
            $stmt = $this->pdo->prepare("
                UPDATE game_rooms 
                SET status = 'playing', started_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$roomId]);
            
            // Crear notificación de juego iniciado
            $this->createNotification($roomId, 'game_started', "¡El juego ha comenzado! Todos los jugadores pueden empezar a calificar.", [
                'player_count' => $playerCount
            ]);
            
            return ['success' => true, 'message' => 'Juego iniciado correctamente'];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al iniciar el juego: ' . $e->getMessage()];
        }
    }
    
    /**
     * Obtener información de la sala
     */
    public function getRoomInfo($roomId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT r.*, p.name as host_name 
                FROM game_rooms r
                LEFT JOIN players p ON r.host_player_id = p.id
                WHERE r.id = ?
            ");
            $stmt->execute([$roomId]);
            $room = $stmt->fetch();
            
            if (!$room) {
                return ['success' => false, 'error' => 'Sala no encontrada'];
            }
            
            // Obtener jugadores
            $stmt = $this->pdo->prepare("
                SELECT id, name, profile_photo, is_host, is_ready, has_finished_rating, joined_at
                FROM players 
                WHERE room_id = ? 
                ORDER BY is_host DESC, joined_at ASC
            ");
            $stmt->execute([$roomId]);
            $players = $stmt->fetchAll();
            
            return [
                'success' => true,
                'data' => [
                    'room' => $room,
                    'players' => $players
                ]
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al obtener información de la sala: ' . $e->getMessage()];
        }
    }
    
    /**
     * Obtener todas las salas disponibles
     */
    public function getAvailableRooms() {
        try {
            $stmt = $this->pdo->prepare("
                SELECT r.room_code, r.status, r.created_at, r.expires_at, 
                       p.name as host_name,
                       (SELECT COUNT(*) FROM players WHERE room_id = r.id) as player_count
                FROM game_rooms r
                LEFT JOIN players p ON r.host_player_id = p.id
                WHERE r.status IN ('waiting', 'playing') AND r.expires_at > NOW()
                ORDER BY r.created_at DESC
                LIMIT 50
            ");
            $stmt->execute();
            $rooms = $stmt->fetchAll();
            
            return ['success' => true, 'data' => $rooms];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al obtener salas: ' . $e->getMessage()];
        }
    }
    
    /**
     * Generar código único para la sala
     */
    private function generateUniqueRoomCode() {
        do {
            $code = '';
            $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            for ($i = 0; $i < 6; $i++) {
                $code .= $chars[rand(0, strlen($chars) - 1)];
            }
            
            $stmt = $this->pdo->prepare("SELECT id FROM game_rooms WHERE room_code = ?");
            $stmt->execute([$code]);
        } while ($stmt->fetch());
        
        return $code;
    }
    
    /**
     * Generar ID de sesión único
     */
    private function generateSessionId() {
        return bin2hex(random_bytes(32));
    }
    
    /**
     * Crear notificación
     */
    private function createNotification($roomId, $type, $message, $data = null) {
        $stmt = $this->pdo->prepare("
            INSERT INTO notifications (room_id, type, message, data) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$roomId, $type, $message, $data ? json_encode($data) : null]);
    }
}
?>