<?php
/**
 * Script de limpieza automática
 * Ejecutar diariamente para limpiar salas expiradas y datos antiguos
 * Cron: 0 2 * * * php /path/to/backend/cron/cleanup.php
 */

require_once '../config/database.php';

try {
    echo "[" . date('Y-m-d H:i:s') . "] Iniciando limpieza automática...\n";
    
    // 1. Limpiar salas expiradas (más de 7 días después de expirar)
    $stmt = $pdo->prepare("
        DELETE FROM game_rooms 
        WHERE status IN ('expired', 'finished') 
        AND (finished_at < DATE_SUB(NOW(), INTERVAL 7 DAY) OR expires_at < DATE_SUB(NOW(), INTERVAL 7 DAY))
    ");
    $stmt->execute();
    $deletedRooms = $stmt->rowCount();
    echo "Salas expiradas eliminadas: {$deletedRooms}\n";
    
    // 2. Limpiar notificaciones antiguas (más de 30 días)
    $stmt = $pdo->prepare("
        DELETE FROM notifications 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    ");
    $stmt->execute();
    $deletedNotifications = $stmt->rowCount();
    echo "Notificaciones antiguas eliminadas: {$deletedNotifications}\n";
    
    // 3. Limpiar jugadores huérfanos (sin sala asociada)
    $stmt = $pdo->prepare("
        DELETE p FROM players p
        LEFT JOIN game_rooms r ON p.room_id = r.id
        WHERE r.id IS NULL
    ");
    $stmt->execute();
    $deletedPlayers = $stmt->rowCount();
    echo "Jugadores huérfanos eliminados: {$deletedPlayers}\n";
    
    // 4. Limpiar calificaciones huérfanas
    $stmt = $pdo->prepare("
        DELETE rt FROM ratings rt
        LEFT JOIN game_rooms r ON rt.room_id = r.id
        WHERE r.id IS NULL
    ");
    $stmt->execute();
    $deletedRatings = $stmt->rowCount();
    echo "Calificaciones huérfanas eliminadas: {$deletedRatings}\n";
    
    // 5. Actualizar estadísticas de limpieza
    $stmt = $pdo->prepare("
        INSERT INTO notifications (room_id, type, message, data) 
        SELECT r.id, 'maintenance', 'Limpieza automática ejecutada', JSON_OBJECT(
            'deleted_rooms', ?, 
            'deleted_notifications', ?, 
            'deleted_players', ?, 
            'deleted_ratings', ?,
            'timestamp', NOW()
        )
        FROM game_rooms r 
        WHERE r.status = 'playing' AND r.id = (SELECT MIN(id) FROM game_rooms WHERE status = 'playing')
        LIMIT 1
    ");
    $stmt->execute([$deletedRooms, $deletedNotifications, $deletedPlayers, $deletedRatings]);
    
    // 6. Optimizar tablas si se eliminaron muchos registros
    $totalDeleted = $deletedRooms + $deletedNotifications + $deletedPlayers + $deletedRatings;
    if ($totalDeleted > 100) {
        echo "Optimizando tablas debido a {$totalDeleted} registros eliminados...\n";
        $pdo->exec("OPTIMIZE TABLE game_rooms, players, ratings, notifications");
        echo "Optimización completada\n";
    }
    
    // 7. Reportar estadísticas actuales
    $stmt = $pdo->query("SELECT COUNT(*) as active_rooms FROM game_rooms WHERE status IN ('waiting', 'playing')");
    $activeRooms = $stmt->fetch()['active_rooms'];
    
    $stmt = $pdo->query("SELECT COUNT(*) as total_players FROM players");
    $totalPlayers = $stmt->fetch()['total_players'];
    
    echo "\n=== ESTADÍSTICAS ACTUALES ===\n";
    echo "Salas activas: {$activeRooms}\n";
    echo "Total de jugadores: {$totalPlayers}\n";
    echo "Registros eliminados en esta limpieza: {$totalDeleted}\n";
    
    echo "[" . date('Y-m-d H:i:s') . "] Limpieza completada exitosamente\n";
    
} catch (Exception $e) {
    echo "Error durante la limpieza: " . $e->getMessage() . "\n";
    
    // Log del error
    error_log("Error en limpieza automática: " . $e->getMessage());
}
?>