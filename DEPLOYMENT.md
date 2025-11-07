# 🚀 Guía de Despliegue

## Despliegue en InfinityFree (Hosting Gratuito)

### 📋 Pre-requisitos
- Cuenta en [InfinityFree](https://infinityfree.net)
- Node.js 16+ instalado localmente
- Archivos del proyecto descargados

---

## 🔧 Paso a Paso

### 1️⃣ Preparar el Frontend

```bash
# Instalar dependencias
npm install

# Configurar API URL para producción
# Editar src/utils/api.js
```

En `src/utils/api.js`, actualiza la URL de producción:
```javascript
const API_CONFIG = {
    localhost: 'http://localhost/birthday-game/backend',
    production: 'https://TU-SUBDOMINIO.infinityfreeapp.com/backend' // ⚠️ CAMBIAR AQUÍ
};
```

```bash
# Construir para producción
npm run build
```

### 2️⃣ Configurar Base de Datos en InfinityFree

1. **Acceder al Panel de Control**
   - Login en tu cuenta de InfinityFree
   - Ve a "MySQL Databases"

2. **Crear Base de Datos**
   - Clic en "Create Database"
   - Nombre: `birthday_game` (o el que prefieras)
   - **Anota**: nombre completo, usuario y contraseña

3. **Datos típicos de InfinityFree:**
   ```
   Host: sql200.infinityfree.com (o similar)
   Database: if0_XXXXXXX_birthday_game
   Username: if0_XXXXXXX
   Password: [tu contraseña generada]
   ```

### 3️⃣ Configurar Backend

1. **Editar configuración de BD**
   
   En `backend/config/database.php`:
   ```php
   if (strpos($host, 'infinityfree') !== false || strpos($host, '.epizy.com') !== false) {
       // Configuración para InfinityFree - ⚠️ ACTUALIZAR ESTOS DATOS
       $config = [
           'host' => 'sql200.infinityfree.com',        // Tu host de BD
           'dbname' => 'if0_XXXXXXX_birthday_game',    // Tu nombre de BD  
           'username' => 'if0_XXXXXXX',                // Tu usuario
           'password' => 'TU_PASSWORD_AQUI',           // Tu contraseña
           'charset' => 'utf8mb4'
       ];
   }
   ```

### 4️⃣ Subir Archivos

1. **Acceder al File Manager**
   - En tu panel de InfinityFree, ve a "File Manager"
   - Navega a `htdocs/`

2. **Subir Frontend (dist/)**
   ```
   htdocs/
   ├── index.html          (desde dist/)
   ├── assets/             (desde dist/assets/)
   └── [otros archivos de dist/]
   ```

3. **Subir Backend**
   ```
   htdocs/backend/
   ├── config/
   ├── classes/
   ├── api/
   ├── cron/
   ├── .htaccess
   ├── index.php
   ├── quick-setup.php
   ├── test.php
   └── install.sql
   ```

### 5️⃣ Ejecutar Instalación

1. **Visitar la instalación automática:**
   ```
   https://TU-SUBDOMINIO.infinityfreeapp.com/backend/quick-setup.php
   ```

2. **Si hay errores, instalación manual:**
   ```
   https://TU-SUBDOMINIO.infinityfreeapp.com/backend/install.sql
   ```
   - Copiar el contenido de `install.sql`
   - Pegarlo en phpMyAdmin de InfinityFree

3. **Verificar instalación:**
   ```
   https://TU-SUBDOMINIO.infinityfreeapp.com/backend/test.php
   ```

### 6️⃣ Configurar Cron Jobs (Opcional)

InfinityFree permite cron jobs limitados:

1. **Ir a "Cron Jobs" en el panel**
2. **Agregar nuevo cron job:**
   ```
   Comando: /usr/local/bin/php /home/volXXXX/htdocs/backend/cron/notifications.php
   Intervalo: Cada hora
   ```

3. **Si no hay cron jobs disponibles:**
   - Las notificaciones funcionarán solo cuando los usuarios estén activos
   - No habrá limpieza automática

---

## ✅ Verificación

### URLs a probar:
- **Sitio principal:** `https://TU-SUBDOMINIO.infinityfreeapp.com`
- **API Status:** `https://TU-SUBDOMINIO.infinityfreeapp.com/backend/api/index.php?path=status`
- **Backend Panel:** `https://TU-SUBDOMINIO.infinityfreeapp.com/backend`
- **Tests:** `https://TU-SUBDOMINIO.infinityfreeapp.com/backend/test.php`

### Pruebas funcionales:
1. ✅ Crear una sala de juego
2. ✅ Compartir código con otro dispositivo/navegador
3. ✅ Unirse a la sala
4. ✅ Iniciar juego multijugador
5. ✅ Calificar mensajes con comentarios
6. ✅ Ver resultados finales

---

## 🔧 Solución de Problemas Comunes

### ❌ Error "Database connection failed"
- Verificar credenciales en `backend/config/database.php`
- Confirmar que la BD existe en InfinityFree
- Revisar que el usuario tiene permisos

### ❌ Error "API not found" o 404
- Verificar que `.htaccess` está en `backend/`
- Confirmar que mod_rewrite está activo (generalmente sí en InfinityFree)
- Revisar la URL del API en `src/utils/api.js`

### ❌ CORS Issues
- Agregar tu dominio a `backend/config/cors.php`
- Verificar protocolo (http vs https)

### ❌ Frontend no carga
- Verificar que todos los archivos de `dist/` están en `htdocs/`
- Revisar que `index.html` está en la raíz de `htdocs/`

### ❌ Notificaciones no funcionan
- Normal si no hay cron jobs configurados
- Las notificaciones aparecerán cuando los usuarios estén activos

---

## 📈 Optimizaciones Post-Despliegue

### Rendimiento:
- InfinityFree tiene límites de CPU - el sistema está optimizado para esto
- Las consultas están indexadas correctamente
- Limpieza automática previene acumulación de datos

### Monitoreo:
- Usar `https://TU-SITIO.com/backend/` para estadísticas
- Revisar logs de error en el panel de InfinityFree

### Backups:
- InfinityFree no incluye backups automáticos
- Descargar BD periódicamente desde phpMyAdmin

---

## 🎉 ¡Listo!

Tu juego multijugador de cumpleaños estará disponible en:
**`https://TU-SUBDOMINIO.infinityfreeapp.com`**

¡Comparte la URL con tus amigos y disfruta calificando mensajes de felicitaciones juntos! 🎂🎉