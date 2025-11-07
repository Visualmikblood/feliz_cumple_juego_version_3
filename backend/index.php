<?php
/**
 * Página principal del backend
 * Panel de administración y estado del sistema
 */

require_once 'config/cors.php';
require_once 'config/database.php';

$page = $_GET['page'] ?? 'dashboard';

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Backend - Juego de Cumpleaños Multijugador</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem 0; margin-bottom: 2rem; }
        .nav { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .nav-btn { padding: 0.75rem 1.5rem; background: white; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .nav-btn:hover { background: #f1f5f9; transform: translateY(-1px); }
        .nav-btn.active { background: #3b82f6; color: white; }
        .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .stat { display: inline-block; margin: 1rem; padding: 1rem; background: #f8fafc; border-radius: 8px; min-width: 150px; text-align: center; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #3b82f6; }
        .stat-label { color: #64748b; margin-top: 0.5rem; }
        .success { color: #22c55e; background: #dcfce7; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
        .error { color: #ef4444; background: #fee2e2; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
        .btn { background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; margin: 0.25rem; }
        .btn:hover { background: #2563eb; }
        .btn-secondary { background: #64748b; }
        .btn-danger { background: #ef4444; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; font-weight: 600; }
        .status-waiting { color: #f59e0b; }
        .status-playing { color: #3b82f6; }
        .status-finished { color: #22c55e; }
        .status-expired { color: #ef4444; }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>🎉 Backend - Juego de Cumpleaños Multijugador</h1>
            <p>Panel de administración y monitoreo del sistema</p>
        </div>
    </div>

    <div class="container">
        <div class="nav">
            <button class="nav-btn <?= $page === 'dashboard' ? 'active' : '' ?>" onclick="changePage('dashboard')">📊 Dashboard</button>
            <button class="nav-btn <?= $page === 'rooms' ? 'active' : '' ?>" onclick="changePage('rooms')">🏠 Salas</button>
            <button class="nav-btn <?= $page === 'players' ? 'active' : '' ?>" onclick="changePage('players')">👥 Jugadores</button>
            <button class="nav-btn <?= $page === 'stats' ? 'active' : '' ?>" onclick="changePage('stats')">📈 Estadísticas</button>
            <button class="nav-btn" onclick="window.open('test.php', '_blank')">🧪 Pruebas</button>
        </div>

        <?php if ($page === 'dashboard'): ?>
            <div class="card">
                <h2>📊 Resumen del Sistema</h2>
                
                <?php
                try {
                    // Estadísticas generales
                    $stmt = $pdo->query("SELECT COUNT(*) as total FROM game_rooms");
                    $totalRooms = $stmt->fetch()['total'];
                    
                    $stmt = $pdo->query("SELECT COUNT(*) as active FROM game_rooms WHERE status IN ('waiting', 'playing')");
                    $activeRooms = $stmt->fetch()['active'];
                    
                    $stmt = $pdo->query("SELECT COUNT(*) as total FROM players");
                    $totalPlayers = $stmt->fetch()['total'];
                    
                    $stmt = $pdo->query("SELECT COUNT(*) as total FROM ratings");
                    $totalRatings = $stmt->fetch()['total'];
                    
                    echo "<div class='success'>✅ Sistema funcionando correctamente</div>";
                    
                    echo "<div style='display: flex; flex-wrap: wrap;'>";
                    echo "<div class='stat'><div class='stat-value'>{$totalRooms}</div><div class='stat-label'>Salas Totales</div></div>";
                    echo "<div class='stat'><div class='stat-value'>{$activeRooms}</div><div class='stat-label'>Salas Activas</div></div>";
                    echo "<div class='stat'><div class='stat-value'>{$totalPlayers}</div><div class='stat-label'>Total Jugadores</div></div>";
                    echo "<div class='stat'><div class='stat-value'>{$totalRatings}</div><div class='stat-label'>Calificaciones</div></div>";
                    echo "</div>";
                    
                } catch (Exception $e) {
                    echo "<div class='error'>❌ Error de conexión: " . htmlspecialchars($e->getMessage()) . "</div>";
                }
                ?>
                
                <div style="margin-top: 2rem;">
                    <h3>🔗 Enlaces Útiles</h3>
                    <p style="margin: 1rem 0;">
                        <a href="api/index.php?path=status" target="_blank"><button class="btn">Estado de API</button></a>
                        <a href="quick-setup.php" target="_blank"><button class="btn btn-secondary">Instalación</button></a>
                        <button class="btn btn-secondary" onclick="runCleanup()">Ejecutar Limpieza</button>
                    </p>
                </div>
            </div>

        <?php elseif ($page === 'rooms'): ?>
            <div class="card">
                <h2>🏠 Salas de Juego</h2>
                
                <?php
                try {
                    $stmt = $pdo->query("
                        SELECT r.*, p.name as host_name, 
                               (SELECT COUNT(*) FROM players WHERE room_id = r.id) as player_count
                        FROM game_rooms r
                        LEFT JOIN players p ON r.host_player_id = p.id
                        ORDER BY r.created_at DESC
                        LIMIT 50
                    ");
                    $rooms = $stmt->fetchAll();
                    
                    if (empty($rooms)) {
                        echo "<p>No hay salas creadas aún.</p>";
                    } else {
                        echo "<table>";
                        echo "<tr><th>Código</th><th>Host</th><th>Estado</th><th>Jugadores</th><th>Creada</th><th>Expira</th><th>Acciones</th></tr>";
                        
                        foreach ($rooms as $room) {
                            $statusClass = 'status-' . $room['status'];
                            $statusText = ucfirst($room['status']);
                            $createdAt = date('d/m/Y H:i', strtotime($room['created_at']));
                            $expiresAt = $room['expires_at'] ? date('d/m/Y H:i', strtotime($room['expires_at'])) : '-';
                            
                            echo "<tr>";
                            echo "<td><strong>{$room['room_code']}</strong></td>";
                            echo "<td>{$room['host_name']}</td>";
                            echo "<td class='{$statusClass}'>{$statusText}</td>";
                            echo "<td>{$room['player_count']}</td>";
                            echo "<td>{$createdAt}</td>";
                            echo "<td>{$expiresAt}</td>";
                            echo "<td>";
                            if ($room['status'] === 'waiting' || $room['status'] === 'playing') {
                                echo "<button class='btn btn-danger' onclick='closeRoom({$room['id']})'>Cerrar</button>";
                            }
                            echo "</td>";
                            echo "</tr>";
                        }
                        echo "</table>";
                    }
                    
                } catch (Exception $e) {
                    echo "<div class='error'>Error: " . htmlspecialchars($e->getMessage()) . "</div>";
                }
                ?>
            </div>

        <?php elseif ($page === 'players'): ?>
            <div class="card">
                <h2>👥 Jugadores Activos</h2>
                
                <?php
                try {
                    $stmt = $pdo->query("
                        SELECT p.*, r.room_code, r.status as room_status
                        FROM players p
                        JOIN game_rooms r ON p.room_id = r.id
                        WHERE r.status IN ('waiting', 'playing')
                        ORDER BY p.joined_at DESC
                        LIMIT 100
                    ");
                    $players = $stmt->fetchAll();
                    
                    if (empty($players)) {
                        echo "<p>No hay jugadores activos.</p>";
                    } else {
                        echo "<table>";
                        echo "<tr><th>Nombre</th><th>Sala</th><th>Estado Sala</th><th>Es Host</th><th>Terminó</th><th>Se Unió</th></tr>";
                        
                        foreach ($players as $player) {
                            $joinedAt = date('d/m/Y H:i', strtotime($player['joined_at']));
                            $isHost = $player['is_host'] ? '👑 Sí' : 'No';
                            $finished = $player['has_finished_rating'] ? '✅ Sí' : '⏳ No';
                            
                            echo "<tr>";
                            echo "<td><strong>{$player['name']}</strong></td>";
                            echo "<td>{$player['room_code']}</td>";
                            echo "<td class='status-{$player['room_status']}'>" . ucfirst($player['room_status']) . "</td>";
                            echo "<td>{$isHost}</td>";
                            echo "<td>{$finished}</td>";
                            echo "<td>{$joinedAt}</td>";
                            echo "</tr>";
                        }
                        echo "</table>";
                    }
                    
                } catch (Exception $e) {
                    echo "<div class='error'>Error: " . htmlspecialchars($e->getMessage()) . "</div>";
                }
                ?>
            </div>

        <?php elseif ($page === 'stats'): ?>
            <div class="card">
                <h2>📈 Estadísticas Avanzadas</h2>
                
                <?php
                try {
                    // Estadísticas por día
                    $stmt = $pdo->query("
                        SELECT DATE(created_at) as date, COUNT(*) as rooms_created
                        FROM game_rooms
                        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                        GROUP BY DATE(created_at)
                        ORDER BY date DESC
                    ");
                    $dailyStats = $stmt->fetchAll();
                    
                    echo "<h3>📊 Salas Creadas (Últimos 7 días)</h3>";
                    echo "<table>";
                    echo "<tr><th>Fecha</th><th>Salas Creadas</th></tr>";
                    foreach ($dailyStats as $stat) {
                        echo "<tr><td>{$stat['date']}</td><td>{$stat['rooms_created']}</td></tr>";
                    }
                    echo "</table>";
                    
                    // Promedio de calificaciones
                    $stmt = $pdo->query("
                        SELECT m.name, AVG(r.rating) as avg_rating, COUNT(r.rating) as total_ratings
                        FROM congratulation_messages m
                        LEFT JOIN ratings r ON m.id = r.message_id
                        GROUP BY m.id, m.name
                        ORDER BY avg_rating DESC
                    ");
                    $messageStats = $stmt->fetchAll();
                    
                    echo "<h3>⭐ Promedio de Calificaciones por Mensaje</h3>";
                    echo "<table>";
                    echo "<tr><th>Amigo</th><th>Promedio</th><th>Total Calificaciones</th></tr>";
                    foreach ($messageStats as $stat) {
                        $avg = $stat['avg_rating'] ? number_format($stat['avg_rating'], 1) : 'Sin calificar';
                        echo "<tr><td>{$stat['name']}</td><td>{$avg}</td><td>{$stat['total_ratings']}</td></tr>";
                    }
                    echo "</table>";
                    
                } catch (Exception $e) {
                    echo "<div class='error'>Error: " . htmlspecialchars($e->getMessage()) . "</div>";
                }
                ?>
            </div>
        <?php endif; ?>
    </div>

    <script>
        function changePage(page) {
            window.location.href = '?page=' + page;
        }
        
        function closeRoom(roomId) {
            if (confirm('¿Estás seguro de que quieres cerrar esta sala?')) {
                fetch('api/index.php?path=rooms/close', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({roomId: roomId})
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Sala cerrada exitosamente');
                        location.reload();
                    } else {
                        alert('Error: ' + data.error);
                    }
                });
            }
        }
        
        function runCleanup() {
            if (confirm('¿Ejecutar limpieza automática? Esto eliminará datos antiguos.')) {
                fetch('cron/cleanup.php')
                .then(response => response.text())
                .then(data => {
                    alert('Limpieza ejecutada:\n' + data);
                    location.reload();
                });
            }
        }
        
        // Auto-refresh cada 30 segundos
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>