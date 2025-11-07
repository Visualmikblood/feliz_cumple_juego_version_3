<?php
/**
 * Clase para manejar las calificaciones y comentarios
 */

class Rating {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * Guardar una calificación con comentario
     */
    public function saveRating($roomId, $playerId, $messageId, $rating, $comment = null) {
        try {
            // Verificar que la sala está en estado 'playing'
            $stmt = $this->pdo->prepare("SELECT status FROM game_rooms WHERE id = ?");
            $stmt->execute([$roomId]);
            $room = $stmt->fetch();
            
            if (!$room || $room['status'] !== 'playing') {
                return ['success' => false, 'error' => 'La sala no está disponible para calificar'];
            }
            
            // Verificar que el jugador pertenece a la sala
            $stmt = $this->pdo->prepare("SELECT id FROM players WHERE id = ? AND room_id = ?");
            $stmt->execute([$playerId, $roomId]);
            if (!$stmt->fetch()) {
                return ['success' => false, 'error' => 'Jugador no autorizado'];
            }
            
            // Verificar que el mensaje existe
            $stmt = $this->pdo->prepare("SELECT id FROM congratulation_messages WHERE id = ?");
            $stmt->execute([$messageId]);
            if (!$stmt->fetch()) {
                return ['success' => false, 'error' => 'Mensaje no encontrado'];
            }
            
            // Validar la calificación
            if ($rating < 1 || $rating > 100) {
                return ['success' => false, 'error' => 'La calificación debe estar entre 1 y 100'];
            }
            
            // Insertar o actualizar la calificación
            $stmt = $this->pdo->prepare("
                INSERT INTO ratings (room_id, player_id, message_id, rating, comment) 
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                rating = VALUES(rating), 
                comment = VALUES(comment),
                created_at = NOW()
            ");
            $stmt->execute([$roomId, $playerId, $messageId, $rating, $comment]);
            
            return ['success' => true, 'message' => 'Calificación guardada correctamente'];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al guardar la calificación: ' . $e->getMessage()];
        }
    }
    
    /**
     * Marcar jugador como terminado de calificar
     */
    public function markPlayerFinished($roomId, $playerId) {
        try {
            // Verificar que el jugador ha calificado todos los mensajes
            $stmt = $this->pdo->prepare("SELECT COUNT(*) as total FROM congratulation_messages");
            $stmt->execute();
            $totalMessages = $stmt->fetch()['total'];
            
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as rated 
                FROM ratings 
                WHERE room_id = ? AND player_id = ?
            ");
            $stmt->execute([$roomId, $playerId]);
            $ratedMessages = $stmt->fetch()['rated'];
            
            if ($ratedMessages < $totalMessages) {
                return ['success' => false, 'error' => 'No has calificado todos los mensajes aún'];
            }
            
            // Marcar como terminado
            $stmt = $this->pdo->prepare("
                UPDATE players 
                SET has_finished_rating = 1, finished_rating_at = NOW() 
                WHERE id = ? AND room_id = ?
            ");
            $stmt->execute([$playerId, $roomId]);
            
            // Obtener nombre del jugador
            $stmt = $this->pdo->prepare("SELECT name FROM players WHERE id = ?");
            $stmt->execute([$playerId]);
            $playerName = $stmt->fetch()['name'];
            
            // Crear notificación
            $stmt = $this->pdo->prepare("
                INSERT INTO notifications (room_id, type, message, data) 
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([
                $roomId, 
                'player_finished', 
                "$playerName ha calificado todos los mensajes de felicitaciones", 
                json_encode(['player_name' => $playerName, 'player_id' => $playerId])
            ]);
            
            // Verificar si todos los jugadores han terminado
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total, 
                       SUM(has_finished_rating) as finished 
                FROM players 
                WHERE room_id = ?
            ");
            $stmt->execute([$roomId]);
            $result = $stmt->fetch();
            
            if ($result['total'] == $result['finished']) {
                // Todos han terminado, finalizar la sala
                $this->finishRoom($roomId);
            }
            
            return ['success' => true, 'message' => 'Calificaciones completadas'];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al marcar como terminado: ' . $e->getMessage()];
        }
    }
    
    /**
     * Obtener calificaciones de un jugador
     */
    public function getPlayerRatings($roomId, $playerId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT r.message_id, r.rating, r.comment, r.created_at,
                       m.name as friend_name
                FROM ratings r
                JOIN congratulation_messages m ON r.message_id = m.id
                WHERE r.room_id = ? AND r.player_id = ?
                ORDER BY r.message_id
            ");
            $stmt->execute([$roomId, $playerId]);
            $ratings = $stmt->fetchAll();
            
            return ['success' => true, 'data' => $ratings];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al obtener calificaciones: ' . $e->getMessage()];
        }
    }
    
    /**
     * Obtener todas las calificaciones de la sala
     */
    public function getAllRoomRatings($roomId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT r.message_id, r.player_id, r.rating, r.comment, r.created_at,
                       p.name as player_name, m.name as friend_name
                FROM ratings r
                JOIN players p ON r.player_id = p.id
                JOIN congratulation_messages m ON r.message_id = m.id
                WHERE r.room_id = ?
                ORDER BY r.message_id, r.player_id
            ");
            $stmt->execute([$roomId]);
            $ratings = $stmt->fetchAll();
            
            return ['success' => true, 'data' => $ratings];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al obtener todas las calificaciones: ' . $e->getMessage()];
        }
    }
    
    /**
     * Calcular resultados finales de la sala
     */
    public function calculateResults($roomId) {
        try {
            // Obtener todas las calificaciones agrupadas
            $stmt = $this->pdo->prepare("
                SELECT r.message_id, r.player_id, r.rating, r.comment,
                       p.name as player_name, p.profile_photo,
                       m.name as friend_name, m.color_class, m.icon_name, m.photo_url
                FROM ratings r
                JOIN players p ON r.player_id = p.id
                JOIN congratulation_messages m ON r.message_id = m.id
                WHERE r.room_id = ?
                ORDER BY r.message_id, r.player_id
            ");
            $stmt->execute([$roomId]);
            $allRatings = $stmt->fetchAll();
            
            // Agrupar por jugador y por mensaje
            $playerRatings = [];
            $messageRatings = [];
            
            foreach ($allRatings as $rating) {
                // Por jugador
                if (!isset($playerRatings[$rating['player_id']])) {
                    $playerRatings[$rating['player_id']] = [
                        'name' => $rating['player_name'],
                        'profile_photo' => $rating['profile_photo'],
                        'ratings' => [],
                        'comments' => []
                    ];
                }
                $playerRatings[$rating['player_id']]['ratings'][$rating['message_id']] = $rating['rating'];
                if ($rating['comment']) {
                    $playerRatings[$rating['player_id']]['comments'][$rating['message_id']] = $rating['comment'];
                }
                
                // Por mensaje
                if (!isset($messageRatings[$rating['message_id']])) {
                    $messageRatings[$rating['message_id']] = [
                        'friend_name' => $rating['friend_name'],
                        'color_class' => $rating['color_class'],
                        'icon_name' => $rating['icon_name'],
                        'photo_url' => $rating['photo_url'],
                        'ratings' => [],
                        'comments' => []
                    ];
                }
                $messageRatings[$rating['message_id']]['ratings'][$rating['player_id']] = $rating['rating'];
                if ($rating['comment']) {
                    $messageRatings[$rating['message_id']]['comments'][$rating['player_id']] = [
                        'comment' => $rating['comment'],
                        'player_name' => $rating['player_name']
                    ];
                }
            }
            
            // Calcular promedios por mensaje
            $messageAverages = [];
            foreach ($messageRatings as $messageId => $data) {
                $messageAverages[$messageId] = array_sum($data['ratings']) / count($data['ratings']);
            }
            
            // Encontrar mejor y peor mensaje
            $bestMessageId = array_keys($messageAverages, max($messageAverages))[0];
            $worstMessageId = array_keys($messageAverages, min($messageAverages))[0];
            
            // Calcular promedios por jugador
            $playerAverages = [];
            foreach ($playerRatings as $playerId => $data) {
                $playerAverages[$playerId] = array_sum($data['ratings']) / count($data['ratings']);
            }
            
            return [
                'success' => true,
                'data' => [
                    'player_ratings' => $playerRatings,
                    'message_ratings' => $messageRatings,
                    'message_averages' => $messageAverages,
                    'player_averages' => $playerAverages,
                    'best_message_id' => $bestMessageId,
                    'worst_message_id' => $worstMessageId,
                    'total_players' => count($playerRatings),
                    'total_messages' => count($messageRatings)
                ]
            ];
            
        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Error al calcular resultados: ' . $e->getMessage()];
        }
    }
    
    /**
     * Finalizar la sala cuando todos han terminado
     */
    private function finishRoom($roomId) {
        try {
            $stmt = $this->pdo->prepare("
                UPDATE game_rooms 
                SET status = 'finished', finished_at = NOW() 
                WHERE id = ?
            ");
            $stmt->execute([$roomId]);
            
            // Crear notificación de finalización
            $stmt = $this->pdo->prepare("
                INSERT INTO notifications (room_id, type, message, data) 
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([
                $roomId, 
                'room_closed', 
                "¡Sala cerrada! Todos los jugadores han terminado de calificar. Ya puedes ver los resultados finales.", 
                json_encode(['finished_at' => date('Y-m-d H:i:s')])
            ]);
            
        } catch (Exception $e) {
            error_log("Error al finalizar sala: " . $e->getMessage());
        }
    }
}
?>