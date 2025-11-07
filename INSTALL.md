# 🚀 Guía de Instalación Rápida

## Instalación en 3 Pasos

### 📋 Requisitos Previos
- **Servidor web** con PHP 7.4+
- **Base de datos MySQL** 5.7+ o MariaDB
- **Node.js** 16+ (para desarrollo)

---

## 🏠 Instalación en Localhost

### Paso 1: Configurar Base de Datos
```sql
CREATE DATABASE birthday_game;
```

### Paso 2: Configurar Backend
1. Edita `backend/config/database.php`:
```php
// Para localhost, usar estos valores:
'host' => 'localhost',
'dbname' => 'birthday_game', 
'username' => 'root',
'password' => '',
```

2. Ejecuta la instalación automática:
```
http://localhost/tu-proyecto/backend/quick-setup.php
```

### Paso 3: Configurar Frontend
1. Instalar dependencias:
```bash
npm install
```

2. Iniciar servidor de desarrollo:
```bash
npm run dev
```

3. Abrir en navegador: `http://localhost:5173`

---

## 🌐 Instalación en InfinityFree

### Paso 1: Crear Base de Datos
1. Ve al panel de control de InfinityFree
2. Crea una nueva base de datos MySQL
3. Anota: nombre BD, usuario, contraseña

### Paso 2: Subir Archivos
1. **Backend**: Sube la carpeta `backend/` al servidor
2. **Frontend**: Ejecuta `npm run build` y sube `dist/` como tu sitio web

### Paso 3: Configurar
1. Edita `backend/config/database.php` en el servidor:
```php
// Configuración para InfinityFree
$config = [
    'host' => 'sql200.infinityfree.com', // Tu host
    'dbname' => 'if0_XXXXXXX_birthday_game', // Tu BD
    'username' => 'if0_XXXXXXX', // Tu usuario  
    'password' => 'tu_password_aqui', // Tu contraseña
];
```

2. Ejecuta la instalación:
```
https://tu-sitio.infinityfreeapp.com/backend/quick-setup.php
```

3. Edita `src/utils/api.js` (antes del build):
```javascript
const API_CONFIG = {
    production: 'https://tu-sitio.infinityfreeapp.com/backend'
};
```

---

## ✅ Verificación

### Pruebas Automáticas
```
http://tu-sitio.com/backend/test.php
```

### Pruebas Manuales
1. ✅ Crear una sala de juego
2. ✅ Unirse con otro jugador
3. ✅ Iniciar juego y calificar mensajes
4. ✅ Ver resultados multijugador

---

## 🔧 Solución de Problemas

### Error de Conexión BD
- Verifica credenciales en `backend/config/database.php`
- Confirma que la base de datos existe
- Revisa permisos del usuario de BD

### API No Responde
- Verifica que `.htaccess` esté presente
- Confirma que mod_rewrite esté activo
- Revisa logs de error del servidor

### CORS Issues
- Actualiza dominios en `backend/config/cors.php`
- Verifica protocolo HTTP vs HTTPS

### Notificaciones No Funcionan
- Configura cron job: `0 * * * * php /path/backend/cron/notifications.php`
- Verifica permisos de escritura

---

## 📞 Soporte

Si tienes problemas:
1. 🧪 Ejecuta las pruebas automáticas
2. 📋 Revisa los logs de error
3. 📖 Consulta la documentación completa en `README_MULTIJUGADOR.md`

---

## 🎉 ¡Listo!

Una vez completada la instalación:
- Crea tu primera sala de juego
- Comparte el código con amigos
- ¡Disfruta calificando mensajes de cumpleaños!