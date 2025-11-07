<?php
/**
 * Clase para manejar las notificaciones del sistema
 */

class Notification {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * Obtener notificaciones de una sala
     */
    public function getRoomNotifications($roomId, $limit = 50) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT id, type, message, data, created_at, is_sent
                FROM notifications
                WHERE room_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            ");
            $stmt->execute([$roomId, $limit]);
            $notifications = $stmt->fetchAll();
            
            return ['success' => true, 'data' => $notifications];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al obtener notificaciones: ' . $e->getMessage()];
        }
    }
    
    /**
     * Obtener notificaciones no leídas
     */
    public function getUnreadNotifications($roomId, $since = null) {
        try {
            $sql = "
                SELECT id, type, message, data, created_at
                FROM notifications
                WHERE room_id = ? AND is_sent = 0
            ";
            $params = [$roomId];
            
            if ($since) {
                $sql .= " AND created_at > ?";
                $params[] = $since;
            }
            
            $sql .= " ORDER BY created_at ASC";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $notifications = $stmt->fetchAll();
            
            // Marcar como leídas
            if (!empty($notifications)) {
                $ids = array_column($notifications, 'id');
                $placeholders = str_repeat('?,', count($ids) - 1) . '?';
                $stmt = $this->pdo->prepare("UPDATE notifications SET is_sent = 1 WHERE id IN ($placeholders)");
                $stmt->execute($ids);
            }
            
            return ['success' => true, 'data' => $notifications];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al obtener notificaciones: ' . $e->getMessage()];
        }
    }
    
    /**
     * Crear notificación de advertencia de tiempo
     */
    public function checkTimeWarnings() {
        try {
            // Buscar salas que expiran en 24 horas y no han sido notificadas
            $stmt = $this->pdo->prepare("
                SELECT r.id, r.room_code, r.expires_at
                FROM game_rooms r
                WHERE r.status = 'playing'
                AND r.expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 25 HOUR)
                AND NOT EXISTS (
                    SELECT 1 FROM notifications n 
                    WHERE n.room_id = r.id AND n.type = 'one_day_left'
                )
            ");
            $stmt->execute();
            $rooms = $stmt->fetchAll();
            
            foreach ($rooms as $room) {
                $stmt = $this->pdo->prepare("
                    INSERT INTO notifications (room_id, type, message, data) 
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([
                    $room['id'], 
                    'one_day_left', 
                    "¡Atención! Solo queda 1 día para terminar de calificar en la sala {$room['room_code']}", 
                    json_encode(['expires_at' => $room['expires_at']])
                ]);
            }
            
            return ['success' => true, 'warnings_sent' => count($rooms)];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al verificar advertencias: ' . $e->getMessage()];
        }
    }
    
    /**
     * Expirar salas que han pasado el tiempo límite
     */
    public function expireRooms() {
        try {
            // Obtener salas que han expirado
            $stmt = $this->pdo->prepare("
                SELECT id, room_code 
                FROM game_rooms 
                WHERE status IN ('waiting', 'playing') 
                AND expires_at < NOW()
            ");
            $stmt->execute();
            $expiredRooms = $stmt->fetchAll();
            
            foreach ($expiredRooms as $room) {
                // Actualizar estado de la sala
                $stmt = $this->pdo->prepare("
                    UPDATE game_rooms 
                    SET status = 'expired', finished_at = NOW() 
                    WHERE id = ?
                ");
                $stmt->execute([$room['id']]);
                
                // Crear notificación de expiración
                $stmt = $this->pdo->prepare("
                    INSERT INTO notifications (room_id, type, message, data) 
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([
                    $room['id'], 
                    'room_closed', 
                    "Tiempo agotado. La sala {$room['room_code']} ha sido cerrada automáticamente.", 
                    json_encode(['expired' => true, 'closed_at' => date('Y-m-d H:i:s')])
                ]);
            }
            
            return ['success' => true, 'expired_rooms' => count($expiredRooms)];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al expirar salas: ' . $e->getMessage()];
        }
    }
}
?>