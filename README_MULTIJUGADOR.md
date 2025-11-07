# 🎉 Juego de Cumpleaños - Modo Multijugador

## 📋 Descripción

Sistema multijugador completo para el juego de calificaciones de mensajes de felicitaciones de cumpleaños. Permite que múltiples jugadores califiquen los mismos mensajes y comparen resultados en tiempo real.

## ✨ Características Principales

### 🏠 Salas de Juego
- **Creación de salas** con códigos únicos de 6 caracteres
- **Sistema de host** para controlar el inicio del juego
- **Límite de tiempo configurable** (24h, 48h, 72h, 1 semana)
- **Lista de salas disponibles** para unirse fácilmente

### 👥 Sistema Multijugador
- **Mínimo 2 jugadores** por sala
- **Máximo ilimitado** de jugadores
- **Estado en tiempo real** de cada jugador
- **Notificaciones automáticas** del progreso

### ⭐ Calificaciones y Comentarios
- **Calificación de 1-100** para cada mensaje
- **Comentarios opcionales** por calificación
- **Guardado automático** en base de datos
- **Historial completo** de todas las calificaciones

### 🔔 Sistema de Notificaciones
- **Notificación cuando un jugador termina** de calificar
- **Advertencia 1 día antes** del cierre
- **Notificación de cierre automático** de sala
- **Updates en tiempo real** sin recargar página

### 📊 Resultados Detallados
- **Promedio por mensaje** de felicitación
- **Ranking de mejores/peores** mensajes
- **Ranking de jugadores** por promedio de calificación
- **Tabla completa** con todas las calificaciones
- **Comentarios individuales** de cada jugador

## 🚀 Instalación

### Requisitos
- **Servidor web** con PHP 7.4+
- **Base de datos MySQL** 5.7+ o MariaDB
- **Navegador moderno** con soporte para JavaScript ES6+

### Paso 1: Configurar Base de Datos

#### Para Localhost:
```sql
CREATE DATABASE birthday_game;
```

#### Para InfinityFree:
1. Ve a tu panel de control
2. Crea una nueva base de datos MySQL
3. Anota el nombre de la base de datos, usuario y contraseña

### Paso 2: Configurar Backend

1. **Edita `backend/config/database.php`:**
```php
// Para InfinityFree, cambia estos valores:
$config = [
    'host' => 'sql200.infinityfree.com', // Tu host de BD
    'dbname' => 'if0_XXXXXXX_birthday_game', // Tu nombre de BD
    'username' => 'if0_XXXXXXX', // Tu usuario
    'password' => 'tu_password_aqui', // Tu contraseña
    'charset' => 'utf8mb4'
];
```

2. **Ejecutar instalación:**
   - Sube todos los archivos del backend a tu hosting
   - Visita `https://tu-sitio.com/backend/setup.php`
   - Sigue las instrucciones en pantalla

### Paso 3: Configurar Frontend

1. **Edita `src/utils/api.js`:**
```javascript
const API_CONFIG = {
    localhost: 'http://localhost/birthday-game/backend',
    production: 'https://tu-sitio.infinityfreeapp.com/backend' // Tu dominio
};
```

### Paso 4: Configurar Cron Job (Opcional)

Para notificaciones automáticas, configura un cron job que ejecute cada hora:
```bash
0 * * * * php /path/to/backend/cron/notifications.php
```

En InfinityFree, puedes usar el panel de control para configurar cron jobs.

## 🎮 Cómo Usar

### Para el Host (Creador de Sala)

1. **Crear Sala:**
   - Ingresa tu nombre
   - Selecciona el límite de tiempo
   - Haz clic en "Crear Sala"
   - Comparte el código de 6 caracteres con otros jugadores

2. **Iniciar Juego:**
   - Espera a que se unan al menos 2 jugadores
   - Haz clic en "¡Iniciar Juego!"
   - Todos los jugadores comenzarán a calificar

### Para Jugadores

1. **Unirse a Sala:**
   - Ingresa tu nombre
   - Introduce el código de sala de 6 caracteres
   - Haz clic en "Unirse"

2. **Calificar Mensajes:**
   - Haz clic en cada bolita para leer los mensajes
   - Califica de 1-100 usando el deslizador
   - Opcionalmente agrega comentarios
   - Repite para todos los 11 mensajes

3. **Ver Resultados:**
   - Cuando todos terminen, se mostrarán automáticamente
   - Ve el ranking de mensajes y jugadores
   - Comparte los resultados en redes sociales

## 📱 Características Técnicas

### Frontend
- **React 18** con Hooks
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **API REST** con fetch nativo
- **Polling automático** para actualizaciones

### Backend
- **PHP 8.0+** compatible
- **MySQL/MariaDB** base de datos
- **PDO** para consultas seguras
- **CORS** habilitado para desarrollo
- **Arquitectura RESTful**

### Seguridad
- **Prepared statements** para prevenir SQL injection
- **Validación de datos** en frontend y backend
- **Sesiones seguras** con tokens únicos
- **CORS configurado** correctamente

## 🔧 API Endpoints

### Salas
- `POST /api/rooms/create` - Crear nueva sala
- `POST /api/rooms/join` - Unirse a sala
- `POST /api/rooms/start` - Iniciar juego
- `GET /api/rooms/info` - Información de sala
- `GET /api/rooms/available` - Salas disponibles

### Calificaciones  
- `POST /api/ratings/save` - Guardar calificación
- `POST /api/ratings/finish` - Finalizar calificaciones
- `GET /api/ratings/results` - Obtener resultados

### Notificaciones
- `GET /api/notifications/room` - Notificaciones de sala
- `GET /api/notifications/unread` - No leídas

## 🎨 Personalización

### Mensajes de Felicitaciones
Los mensajes se pueden personalizar editando la tabla `congratulation_messages` en la base de datos o modificando el archivo `src/App.jsx`.

### Estilos
El sistema usa Tailwind CSS. Los colores y estilos se pueden personalizar en:
- `src/index.css` - Estilos globales
- `tailwind.config.js` - Configuración de Tailwind

### Tiempo Límites
Los límites de tiempo se pueden ajustar en:
- Frontend: `src/App.jsx` (opciones del select)
- Backend: `backend/classes/GameRoom.php` (validaciones)

## 🐛 Solución de Problemas

### Error de Conexión a Base de Datos
1. Verifica las credenciales en `backend/config/database.php`
2. Asegúrate de que la base de datos existe
3. Confirma que el usuario tiene permisos correctos

### API No Responde
1. Verifica que el archivo `.htaccess` esté presente
2. Confirma que mod_rewrite está habilitado
3. Revisa los logs de error del servidor

### Notificaciones No Funcionan
1. Configura el cron job correctamente
2. Verifica permisos de escritura en el servidor
3. Revisa la configuración de CORS

### Problemas de CORS
1. Actualiza los dominios permitidos en `backend/config/cors.php`
2. Asegúrate de que el protocolo (http/https) coincida
3. Verifica la configuración del servidor web

## 📞 Soporte

Si encuentras algún problema o necesitas ayuda:

1. **Revisa este README** completo
2. **Verifica los logs** de error del navegador y servidor
3. **Confirma la configuración** de base de datos y API
4. **Prueba en localhost** primero antes de subir al hosting

## 📄 Licencia

Este proyecto es de código abierto y se puede usar libremente para proyectos personales y comerciales.

---

¡Disfruta del juego multijugador de calificaciones de cumpleaños! 🎂🎉