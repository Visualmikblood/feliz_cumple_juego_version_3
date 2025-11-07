<?php
/**
 * Script CRON para manejar notificaciones automáticas
 * Ejecutar cada hora: 0 * * * * php /path/to/backend/cron/notifications.php
 */

require_once '../config/database.php';
require_once '../classes/Notification.php';

try {
    $notification = new Notification($pdo);
    
    echo "[" . date('Y-m-d H:i:s') . "] Iniciando verificación de notificaciones...\n";
    
    // Verificar advertencias de tiempo
    $warningResult = $notification->checkTimeWarnings();
    if ($warningResult['success']) {
        echo "Advertencias enviadas: " . $warningResult['warnings_sent'] . "\n";
    } else {
        echo "Error en advertencias: " . $warningResult['error'] . "\n";
    }
    
    // Expirar salas que han pasado el tiempo límite
    $expireResult = $notification->expireRooms();
    if ($expireResult['success']) {
        echo "Salas expiradas: " . $expireResult['expired_rooms'] . "\n";
    } else {
        echo "Error al expirar salas: " . $expireResult['error'] . "\n";
    }
    
    echo "[" . date('Y-m-d H:i:s') . "] Verificación completada.\n";
    
} catch (Exception $e) {
    echo "Error fatal: " . $e->getMessage() . "\n";
}
?>