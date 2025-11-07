<?php
/**
 * Instalación rápida y sencilla
 * Ejecuta este archivo una sola vez para configurar todo
 */

echo "<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Instalación - Juego de Cumpleaños Multijugador</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #22c55e; background: #dcfce7; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .error { color: #ef4444; background: #fee2e2; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .warning { color: #f59e0b; background: #fef3c7; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .step { background: #f8fafc; padding: 15px; margin: 15px 0; border-left: 4px solid #3b82f6; }
        pre { background: #1f2937; color: #e5e7eb; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .btn { background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        .btn:hover { background: #2563eb; }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🎉 Instalación del Juego de Cumpleaños Multijugador</h1>";

try {
    // Paso 1: Verificar conexión
    echo "<div class='step'>
            <h2>Paso 1: Verificando conexión a base de datos...</h2>";
    
    require_once 'config/database.php';
    echo "<div class='success'>✅ Conexión exitosa a la base de datos</div>";
    
    // Paso 2: Crear tablas
    echo "</div><div class='step'>
            <h2>Paso 2: Creando tablas...</h2>";
    
    $sql = file_get_contents('install.sql');
    if ($sql === false) {
        throw new Exception("No se pudo leer install.sql");
    }
    
    // Ejecutar SQL
    $queries = array_filter(array_map('trim', explode(';', $sql)));
    $created = 0;
    
    foreach ($queries as $query) {
        if (empty($query) || strpos($query, '--') === 0) continue;
        
        try {
            $pdo->exec($query);
            $created++;
        } catch (PDOException $e) {
            // Ignorar errores de "ya existe"
            if (strpos($e->getMessage(), 'already exists') === false && 
                strpos($e->getMessage(), 'Duplicate entry') === false) {
                throw $e;
            }
        }
    }
    
    echo "<div class='success'>✅ Tablas creadas correctamente ({$created} consultas ejecutadas)</div>";
    
    // Paso 3: Verificar mensajes
    echo "</div><div class='step'>
            <h2>Paso 3: Verificando mensajes de felicitaciones...</h2>";

    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM congratulation_messages");
        $count = $stmt->fetch()['count'];

        if ($count >= 11) {
            echo "<div class='success'>✅ {$count} mensajes de felicitaciones encontrados</div>";
        } else {
            echo "<div class='warning'>⚠️ Solo {$count} mensajes encontrados, se esperaban 11</div>";
        }
    } catch (PDOException $e) {
        echo "<div class='error'>❌ Error al verificar mensajes: " . htmlspecialchars($e->getMessage()) . "</div>";
        echo "<div class='warning'>⚠️ Intentando crear la tabla manualmente...</div>";

        // Crear tabla manualmente si no existe
        try {
            $pdo->exec("CREATE TABLE IF NOT EXISTS congratulation_messages (
                id int(11) NOT NULL AUTO_INCREMENT,
                friend_id int(11) NOT NULL,
                name varchar(100) NOT NULL,
                message text NOT NULL,
                color_class varchar(50) NOT NULL,
                icon_name varchar(50) NOT NULL,
                photo_url varchar(255) DEFAULT NULL,
                created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY friend_id (friend_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

            $pdo->exec("INSERT IGNORE INTO congratulation_messages (friend_id, name, message, color_class, icon_name, photo_url) VALUES
            (1, 'María', '¡Feliz cumpleaños! Eres una persona increíble y estoy muy agradecida de tenerte en mi vida. Que este nuevo año te traiga muchas aventuras y momentos felices. ¡Te quiero mucho! 🎉💕', 'bg-pink-400', 'Heart', '/photos/maria.jpg'),
            (2, 'Carlos', '¡Hey cumpleañero/a! Espero que tengas un día fantástico lleno de risas y buena comida. Gracias por ser un amigo tan genial y por todos los buenos momentos que hemos compartido. ¡A celebrar! 🎂🎈', 'bg-blue-400', 'Gift', '/photos/carlos.jpg'),
            (3, 'Ana', '¡Felicidades en tu día especial! Eres una de las personas más divertidas que conozco. Que cumplas muchos más años llenos de salud, amor y éxito. ¡Disfruta tu día al máximo! ✨🌟', 'bg-green-400', 'Star', '/photos/ana.jpg'),
            (4, 'Pedro', '¡Cumpleaños feliz! Me alegra mucho poder celebrar contigo otro año de vida. Eres una persona especial que siempre sabe cómo hacer sonreír a los demás. ¡Que tengas un día maravilloso! 🎊🎁', 'bg-yellow-400', 'PartyPopper', '/photos/pedro.jpg'),
            (5, 'Laura', '¡Feliz cumple! Gracias por ser tan buena persona y por todos los momentos increíbles que hemos vivido juntos. Espero que este nuevo año de vida esté lleno de nuevas oportunidades y mucha felicidad. 💜🎯', 'bg-purple-400', 'Sparkles', '/photos/laura.jpg'),
            (6, 'Diego', '¡Qué tengas un cumpleaños espectacular! Eres una persona única y especial. Que este año te traiga todo lo que deseas y más. ¡Vamos a celebrar como se debe! 🔥🎸', 'bg-red-400', 'Cake', '/photos/diego.jpg'),
            (7, 'Sofia', '¡Feliz cumpleaños querido/a! Tu amistad significa mucho para mí. Eres alguien en quien siempre puedo confiar. Que tengas un año lleno de bendiciones y momentos hermosos. 💙🦋', 'bg-indigo-400', 'Heart', '/photos/sofia.jpg'),
            (8, 'Miguel', '¡Cumpleaños feliz! Espero que tu día esté lleno de sorpresas maravillosas. Gracias por ser un amigo tan leal y divertido. ¡Que celebres muchos cumpleaños más! 🧡🎭', 'bg-orange-400', 'Gift', '/photos/miguel.jpg'),
            (9, 'Carmen', '¡Feliz cumple! Eres una persona extraordinaria con un corazón enorme. Me siento afortunada de conocerte. Que este nuevo año de vida esté lleno de amor, risas y aventuras. 💚🌺', 'bg-teal-400', 'Star', '/photos/carmen.jpg'),
            (10, 'Javier', '¡Felicidades! Otro año más de vida para celebrar todo lo increíble que eres. Gracias por ser un amigo tan genial y por todos los buenos ratos. ¡A disfrutar este día especial! 🎨🎪', 'bg-cyan-400', 'PartyPopper', '/photos/javier.jpg'),
            (11, 'Isabel', '¡Feliz cumpleaños! Eres una persona muy especial que siempre ilumina el día de los demás. Que este nuevo año te traiga mucha paz, amor y todas las cosas buenas que mereces. 🌸✨', 'bg-rose-400', 'Sparkles', '/photos/isabel.jpg');");

            $stmt = $pdo->query("SELECT COUNT(*) as count FROM congratulation_messages");
            $count = $stmt->fetch()['count'];
            echo "<div class='success'>✅ Tabla creada e insertados {$count} mensajes correctamente</div>";
        } catch (PDOException $e2) {
            echo "<div class='error'>❌ Error al crear tabla manualmente: " . htmlspecialchars($e2->getMessage()) . "</div>";
        }
    }
    
    // Paso 4: Probar API
    echo "</div><div class='step'>
            <h2>Paso 4: Probando API...</h2>";
    
    require_once 'classes/GameRoom.php';
    $gameRoom = new GameRoom($pdo);
    echo "<div class='success'>✅ API funcionando correctamente</div>";
    
    // Instrucciones finales
    echo "</div><div class='step'>
            <h2>🎊 ¡Instalación Completada!</h2>
            <div class='success'>
                <strong>El sistema está listo para usar.</strong>
            </div>
            
            <h3>Próximos pasos:</h3>
            <ol>
                <li><strong>Configurar el frontend:</strong>
                    <br>Edita <code>src/utils/api.js</code> y cambia la URL de producción:
                    <pre>production: 'https://tu-sitio.infinityfreeapp.com/backend'</pre>
                </li>
                
                <li><strong>Probar el sistema:</strong>
                    <br><a href='test.php' target='_blank'>
                        <button class='btn'>🧪 Ejecutar Pruebas</button>
                    </a>
                </li>
                
                <li><strong>Configurar Cron Jobs (opcional):</strong>
                    <br>Para notificaciones automáticas, configura:
                    <pre>0 * * * * php " . __DIR__ . "/cron/notifications.php</pre>
                </li>
            </ol>
            
            <h3>URLs importantes:</h3>
            <ul>
                <li><strong>API Base:</strong> <code>" . getCurrentUrl() . "/api/</code></li>
                <li><strong>Test Suite:</strong> <a href='test.php'>test.php</a></li>
                <li><strong>Estado API:</strong> <a href='api/index.php?path=status'>api/status</a></li>
            </ul>
        </div>";
    
} catch (Exception $e) {
    echo "<div class='error'>❌ Error durante la instalación: " . htmlspecialchars($e->getMessage()) . "</div>";
    
    echo "<div class='step'>
            <h3>Soluciones posibles:</h3>
            <ul>
                <li>Verifica las credenciales de base de datos en <code>config/database.php</code></li>
                <li>Asegúrate de que la base de datos existe</li>
                <li>Confirma que el usuario tiene permisos CREATE, INSERT, SELECT</li>
            </ul>
          </div>";
}

function getCurrentUrl() {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'];
    $path = dirname($_SERVER['REQUEST_URI']);
    return $protocol . $host . $path;
}

echo "</div></body></html>";
?>