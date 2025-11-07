<?php
/**
 * Endpoint adicional para cerrar salas manualmente
 */

require_once '../config/cors.php';
require_once '../config/database.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true) ?? [];

if ($method === 'POST' && isset($input['roomId'])) {
    try {
        $roomId = $input['roomId'];
        
        // Actualizar estado de la sala
        $stmt = $pdo->prepare("
            UPDATE game_rooms 
            SET status = 'finished', finished_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$roomId]);
        
        // Crear notificación de cierre manual
        $stmt = $pdo->prepare("
            INSERT INTO notifications (room_id, type, message, data) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $roomId, 
            'room_closed', 
            "Sala cerrada manualmente por el administrador", 
            json_encode(['manual_close' => true, 'closed_at' => date('Y-m-d H:i:s')])
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Sala cerrada exitosamente']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Método no permitido o datos faltantes']);
}
?>