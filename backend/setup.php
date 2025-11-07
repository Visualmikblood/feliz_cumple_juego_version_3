<?php
/**
 * Script de instalación para el juego de cumpleaños multijugador
 * Ejecutar una sola vez para crear las tablas y datos iniciales
 */

require_once 'config/database.php';

try {
    echo "<h2>Instalación del juego de cumpleaños multijugador</h2>\n";
    echo "<pre>\n";
    
    // Leer el archivo SQL
    $sql = file_get_contents('database/schema.sql');
    
    if ($sql === false) {
        throw new Exception("No se pudo leer el archivo schema.sql");
    }
    
    // Dividir las consultas
    $queries = array_filter(array_map('trim', explode(';', $sql)));
    
    $successCount = 0;
    $errorCount = 0;
    
    foreach ($queries as $query) {
        if (empty($query) || strpos($query, '--') === 0 || strpos($query, 'SET ') === 0 || strpos($query, 'START TRANSACTION') === 0 || strpos($query, 'COMMIT') === 0) {
            continue;
        }
        
        try {
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            $successCount++;
            echo "✓ Ejecutado: " . substr($query, 0, 50) . "...\n";
        } catch (PDOException $e) {
            $errorCount++;
            echo "✗ Error en: " . substr($query, 0, 50) . "...\n";
            echo "  Error: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n=== RESUMEN ===\n";
    echo "Consultas exitosas: {$successCount}\n";
    echo "Consultas con error: {$errorCount}\n";
    
    if ($errorCount === 0) {
        echo "\n🎉 ¡Instalación completada exitosamente!\n";
        echo "\nPróximos pasos:\n";
        echo "1. Configura tu dominio en src/utils/api.js\n";
        echo "2. Ajusta la configuración de base de datos en backend/config/database.php\n";
        echo "3. Asegúrate de que el servidor web tenga permisos de escritura\n";
        echo "4. Configura el cron job para backend/cron/notifications.php\n";
    } else {
        echo "\n⚠️  Instalación completada con errores. Revisa los mensajes anteriores.\n";
    }
    
    echo "\n";
    echo "</pre>\n";
    
} catch (Exception $e) {
    echo "<pre>Error fatal durante la instalación: " . $e->getMessage() . "</pre>\n";
}
?>