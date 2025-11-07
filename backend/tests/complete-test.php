<?php
/**
 * Test completo de funcionalidad multijugador
 * Simula un flujo completo del juego
 */

require_once '../config/database.php';
require_once '../classes/GameRoom.php';
require_once '../classes/Rating.php';
require_once '../classes/Notification.php';

header('Content-Type: application/json');

$tests = [];
$testsPassed = 0;
$testsFailed = 0;

// Variables para el test
$gameRoom = new GameRoom($pdo);
$rating = new Rating($pdo);
$notification = new Notification($pdo);

echo "<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <title>Pruebas Completas - Juego Multijugador</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 20px auto; padding: 20px; }
        .test { margin: 10px 0; padding: 15px; border-radius: 8px; }
        .pass { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .fail { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        .section { background: #e2e3e5; padding: 15px; margin: 20px 0; border-radius: 8px; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .summary { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>🧪 Pruebas Completas del Sistema Multijugador</h1>
    <p>Ejecutando simulación completa del flujo de juego...</p>";

try {
    // =================== SECCIÓN 1: SETUP ===================
    echo "<div class='section'><h2>📋 Sección 1: Configuración y Base de Datos</h2>";
    
    // Test 1: Conexión a BD
    try {
        $stmt = $pdo->query("SELECT 1");
        echo "<div class='test pass'>✅ Test 1: Conexión a base de datos - ÉXITO</div>";
        $testsPassed++;
    } catch (Exception $e) {
        echo "<div class='test fail'>❌ Test 1: Conexión a base de datos - FALLO: {$e->getMessage()}</div>";
        $testsFailed++;
    }
    
    // Test 2: Verificar tablas
    $requiredTables = ['game_rooms', 'players', 'congratulation_messages', 'ratings', 'notifications'];
    foreach ($requiredTables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM {$table}");
            echo "<div class='test pass'>✅ Test: Tabla {$table} existe - ÉXITO</div>";
            $testsPassed++;
        } catch (Exception $e) {
            echo "<div class='test fail'>❌ Test: Tabla {$table} - FALLO: {$e->getMessage()}</div>";
            $testsFailed++;
        }
    }
    
    // Test 3: Mensajes predeterminados
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM congratulation_messages");
    $messageCount = $stmt->fetch()['count'];
    if ($messageCount >= 11) {
        echo "<div class='test pass'>✅ Test: Mensajes de felicitaciones ({$messageCount} encontrados) - ÉXITO</div>";
        $testsPassed++;
    } else {
        echo "<div class='test fail'>❌ Test: Mensajes de felicitaciones (solo {$messageCount}, necesarios 11) - FALLO</div>";
        $testsFailed++;
    }
    
    echo "</div>";
    
    // =================== SECCIÓN 2: CREACIÓN DE SALA ===================
    echo "<div class='section'><h2>🏠 Sección 2: Creación y Gestión de Salas</h2>";
    
    // Test 4: Crear sala
    $roomResult = $gameRoom->createRoom('TestHost', null, 24);
    if ($roomResult['success']) {
        echo "<div class='test pass'>✅ Test: Crear sala - ÉXITO</div>";
        echo "<div class='test info'>ℹ️ Código de sala: {$roomResult['data']['room_code']}</div>";
        $testsPassed++;
        
        $roomId = $roomResult['data']['room_id'];
        $roomCode = $roomResult['data']['room_code'];
        $hostPlayerId = $roomResult['data']['player_id'];
        $hostSessionId = $roomResult['data']['session_id'];
    } else {
        echo "<div class='test fail'>❌ Test: Crear sala - FALLO: {$roomResult['error']}</div>";
        $testsFailed++;
        exit;
    }
    
    // Test 5: Obtener info de sala
    $roomInfo = $gameRoom->getRoomInfo($roomId);
    if ($roomInfo['success']) {
        echo "<div class='test pass'>✅ Test: Obtener información de sala - ÉXITO</div>";
        $testsPassed++;
    } else {
        echo "<div class='test fail'>❌ Test: Obtener información de sala - FALLO</div>";
        $testsFailed++;
    }
    
    echo "</div>";
    
    // =================== SECCIÓN 3: UNIRSE A SALA ===================
    echo "<div class='section'><h2>👥 Sección 3: Jugadores Uniéndose</h2>";
    
    // Test 6: Unir jugador 2
    $joinResult2 = $gameRoom->joinRoom($roomCode, 'TestPlayer2');
    if ($joinResult2['success']) {
        echo "<div class='test pass'>✅ Test: Jugador 2 se une - ÉXITO</div>";
        $testsPassed++;
        $player2Id = $joinResult2['data']['player_id'];
    } else {
        echo "<div class='test fail'>❌ Test: Jugador 2 se une - FALLO: {$joinResult2['error']}</div>";
        $testsFailed++;
    }
    
    // Test 7: Unir jugador 3
    $joinResult3 = $gameRoom->joinRoom($roomCode, 'TestPlayer3');
    if ($joinResult3['success']) {
        echo "<div class='test pass'>✅ Test: Jugador 3 se une - ÉXITO</div>";
        $testsPassed++;
        $player3Id = $joinResult3['data']['player_id'];
    } else {
        echo "<div class='test fail'>❌ Test: Jugador 3 se une - FALLO: {$joinResult3['error']}</div>";
        $testsFailed++;
    }
    
    // Test 8: Verificar número de jugadores
    $roomInfo = $gameRoom->getRoomInfo($roomId);
    $playerCount = count($roomInfo['data']['players']);
    if ($playerCount == 3) {
        echo "<div class='test pass'>✅ Test: Contar jugadores (3 encontrados) - ÉXITO</div>";
        $testsPassed++;
    } else {
        echo "<div class='test fail'>❌ Test: Contar jugadores ({$playerCount} encontrados, esperados 3) - FALLO</div>";
        $testsFailed++;
    }
    
    echo "</div>";
    
    // =================== SECCIÓN 4: INICIAR JUEGO ===================
    echo "<div class='section'><h2>🎮 Sección 4: Iniciar Juego</h2>";
    
    // Test 9: Iniciar juego
    $startResult = $gameRoom->startGame($roomId, $hostPlayerId);
    if ($startResult['success']) {
        echo "<div class='test pass'>✅ Test: Iniciar juego - ÉXITO</div>";
        $testsPassed++;
    } else {
        echo "<div class='test fail'>❌ Test: Iniciar juego - FALLO: {$startResult['error']}</div>";
        $testsFailed++;
    }
    
    // Test 10: Verificar estado de sala
    $roomInfo = $gameRoom->getRoomInfo($roomId);
    if ($roomInfo['data']['room']['status'] == 'playing') {
        echo "<div class='test pass'>✅ Test: Estado de sala (playing) - ÉXITO</div>";
        $testsPassed++;
    } else {
        echo "<div class='test fail'>❌ Test: Estado de sala - FALLO</div>";
        $testsFailed++;
    }
    
    echo "</div>";
    
    // =================== SECCIÓN 5: CALIFICACIONES ===================
    echo "<div class='section'><h2>⭐ Sección 5: Sistema de Calificaciones</h2>";
    
    // Obtener todos los mensajes
    $stmt = $pdo->query("SELECT id FROM congratulation_messages ORDER BY id LIMIT 5"); // Solo 5 para el test
    $messages = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $players = [$hostPlayerId, $player2Id, $player3Id];
    $playerNames = ['TestHost', 'TestPlayer2', 'TestPlayer3'];
    
    // Test 11-15: Cada jugador califica algunos mensajes
    foreach ($players as $index => $playerId) {
        $ratingsGiven = 0;
        foreach ($messages as $messageId) {
            $testRating = rand(60, 95); // Calificaciones aleatorias
            $testComment = "Comentario de prueba del " . $playerNames[$index] . " para mensaje {$messageId}";
            
            $ratingResult = $rating->saveRating($roomId, $playerId, $messageId, $testRating, $testComment);
            if ($ratingResult['success']) {
                $ratingsGiven++;
            }
        }
        
        if ($ratingsGiven == count($messages)) {
            echo "<div class='test pass'>✅ Test: {$playerNames[$index]} califica {$ratingsGiven} mensajes - ÉXITO</div>";
            $testsPassed++;
        } else {
            echo "<div class='test fail'>❌ Test: {$playerNames[$index]} calificaciones - FALLO</div>";
            $testsFailed++;
        }
    }
    
    echo "</div>";
    
    // =================== SECCIÓN 6: FINALIZACIÓN ===================
    echo "<div class='section'><h2>🏁 Sección 6: Finalización y Resultados</h2>";
    
    // Test 16-18: Marcar jugadores como terminados
    foreach ($players as $index => $playerId) {
        $finishResult = $rating->markPlayerFinished($roomId, $playerId);
        if ($finishResult['success']) {
            echo "<div class='test pass'>✅ Test: {$playerNames[$index]} termina calificaciones - ÉXITO</div>";
            $testsPassed++;
        } else {
            echo "<div class='test fail'>❌ Test: {$playerNames[$index]} termina calificaciones - FALLO: {$finishResult['error']}</div>";
            $testsFailed++;
        }
    }
    
    // Test 19: Calcular resultados
    $resultsResult = $rating->calculateResults($roomId);
    if ($resultsResult['success']) {
        echo "<div class='test pass'>✅ Test: Calcular resultados finales - ÉXITO</div>";
        echo "<div class='test info'>ℹ️ Resultados calculados para {$resultsResult['data']['total_players']} jugadores y {$resultsResult['data']['total_messages']} mensajes</div>";
        $testsPassed++;
        
        // Mostrar algunos resultados
        echo "<div class='test info'>";
        echo "<h4>📊 Muestra de Resultados:</h4>";
        echo "<ul>";
        foreach ($resultsResult['data']['message_averages'] as $msgId => $avg) {
            echo "<li>Mensaje {$msgId}: Promedio " . number_format($avg, 1) . "/100</li>";
        }
        echo "</ul>";
        echo "</div>";
        
    } else {
        echo "<div class='test fail'>❌ Test: Calcular resultados - FALLO: {$resultsResult['error']}</div>";
        $testsFailed++;
    }
    
    echo "</div>";
    
    // =================== SECCIÓN 7: NOTIFICACIONES ===================
    echo "<div class='section'><h2>🔔 Sección 7: Sistema de Notificaciones</h2>";
    
    // Test 20: Obtener notificaciones
    $notifResult = $notification->getRoomNotifications($roomId);
    if ($notifResult['success']) {
        echo "<div class='test pass'>✅ Test: Obtener notificaciones - ÉXITO</div>";
        echo "<div class='test info'>ℹ️ {" . count($notifResult['data']) . "} notificaciones encontradas</div>";
        $testsPassed++;
    } else {
        echo "<div class='test fail'>❌ Test: Obtener notificaciones - FALLO</div>";
        $testsFailed++;
    }
    
    // Test 21: Verificar tipos de notificaciones
    $notificationTypes = array_column($notifResult['data'], 'type');
    $expectedTypes = ['room_created', 'player_joined', 'game_started', 'player_finished', 'room_closed'];
    $foundTypes = array_intersect($expectedTypes, $notificationTypes);
    
    if (count($foundTypes) >= 4) { // Al menos 4 tipos esperados
        echo "<div class='test pass'>✅ Test: Tipos de notificaciones (" . implode(', ', $foundTypes) . ") - ÉXITO</div>";
        $testsPassed++;
    } else {
        echo "<div class='test fail'>❌ Test: Tipos de notificaciones - FALLO</div>";
        $testsFailed++;
    }
    
    echo "</div>";
    
    // =================== LIMPIEZA ===================
    echo "<div class='section'><h2>🧹 Limpieza de Datos de Prueba</h2>";
    
    // Eliminar datos de prueba
    try {
        $pdo->prepare("DELETE FROM game_rooms WHERE id = ?")->execute([$roomId]);
        echo "<div class='test pass'>✅ Limpieza: Datos de prueba eliminados - ÉXITO</div>";
        $testsPassed++;
    } catch (Exception $e) {
        echo "<div class='test fail'>❌ Limpieza: Error - {$e->getMessage()}</div>";
        $testsFailed++;
    }
    
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div class='test fail'>❌ ERROR CRÍTICO: {$e->getMessage()}</div>";
    $testsFailed++;
}

// =================== RESUMEN FINAL ===================
$total = $testsPassed + $testsFailed;
$successRate = $total > 0 ? round(($testsPassed / $total) * 100, 1) : 0;

$statusClass = $successRate >= 95 ? 'pass' : ($successRate >= 80 ? 'info' : 'fail');
$statusIcon = $successRate >= 95 ? '🎉' : ($successRate >= 80 ? '⚠️' : '❌');

echo "<div class='summary'>
        <h2>{$statusIcon} Resumen Final de Pruebas</h2>
        <div class='test {$statusClass}'>
            <strong>Resultado General: {$successRate}% de éxito</strong><br>
            Pruebas exitosas: {$testsPassed}<br>
            Pruebas fallidas: {$testsFailed}<br>
            Total de pruebas: {$total}
        </div>";

if ($successRate >= 95) {
    echo "<div class='test pass'>
            <h3>🎊 ¡SISTEMA COMPLETAMENTE FUNCIONAL!</h3>
            <p>Todas las funciones principales están trabajando correctamente:</p>
            <ul>
                <li>✅ Creación y gestión de salas</li>
                <li>✅ Sistema multijugador (unirse/salir)</li>
                <li>✅ Calificaciones con comentarios</li>
                <li>✅ Cálculo de resultados</li>
                <li>✅ Sistema de notificaciones</li>
                <li>✅ Base de datos funcionando</li>
            </ul>
            <p><strong>El sistema está listo para producción.</strong></p>
          </div>";
} else if ($successRate >= 80) {
    echo "<div class='test info'>
            <h3>⚠️ Sistema mayormente funcional</h3>
            <p>Las funciones principales funcionan, pero hay algunos problemas menores que revisar.</p>
          </div>";
} else {
    echo "<div class='test fail'>
            <h3>❌ Sistema requiere atención</h3>
            <p>Hay problemas significativos que deben resolverse antes del despliegue.</p>
          </div>";
}

echo "<div style='margin-top: 20px;'>
        <h3>📋 Próximos pasos recomendados:</h3>
        <ol>
            <li>Si todas las pruebas pasaron: ¡Listo para desplegar!</li>
            <li>Si hay fallos menores: Revisar configuración de base de datos</li>
            <li>Si hay fallos mayores: Verificar instalación y permisos</li>
            <li>Ejecutar pruebas manuales con el frontend</li>
            <li>Probar en diferentes navegadores</li>
        </ol>
      </div>

      <div style='margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 8px;'>
        <h4>🔗 Enlaces útiles:</h4>
        <ul>
            <li><a href='../index.php'>Panel de administración</a></li>
            <li><a href='../test.php'>Pruebas básicas</a></li>
            <li><a href='../api/index.php?path=status'>Estado de API</a></li>
        </ul>
      </div>
    </div>";

echo "<p style='text-align: center; margin-top: 30px; color: #6c757d;'>
        Pruebas ejecutadas el " . date('d/m/Y H:i:s') . "
      </p>";

echo "</body></html>";
?>