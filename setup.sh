#!/bin/bash

# 🚀 Script de Configuración Automática
# Juego de Cumpleaños Multijugador
# Compatible con Linux/macOS/Windows (Git Bash)

echo "🎉 CONFIGURACIÓN AUTOMÁTICA DEL JUEGO DE CUMPLEAÑOS MULTIJUGADOR"
echo "=================================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes de estado
show_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

show_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    show_error "Este script debe ejecutarse desde la raíz del proyecto (donde está package.json)"
    exit 1
fi

show_info "Iniciando configuración automática..."

# 1. Verificar Node.js
echo ""
echo "🔍 VERIFICANDO DEPENDENCIAS..."
echo "--------------------------------"

if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    show_status "Node.js encontrado: $NODE_VERSION"
else
    show_error "Node.js no está instalado. Por favor instala Node.js 16+ desde https://nodejs.org"
    exit 1
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    show_status "npm encontrado: $NPM_VERSION"
else
    show_error "npm no está instalado"
    exit 1
fi

# 2. Instalar dependencias de Node
echo ""
echo "📦 INSTALANDO DEPENDENCIAS..."
echo "-----------------------------"

if [ ! -d "node_modules" ]; then
    show_info "Instalando dependencias de npm..."
    npm install
    if [ $? -eq 0 ]; then
        show_status "Dependencias instaladas correctamente"
    else
        show_error "Error al instalar dependencias"
        exit 1
    fi
else
    show_status "Dependencias ya instaladas"
fi

# 3. Configurar archivos de configuración
echo ""
echo "⚙️  CONFIGURANDO ARCHIVOS..."
echo "----------------------------"

# Crear .env si no existe
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        show_status "Archivo .env creado desde .env.example"
        show_warning "Recuerda configurar las variables en .env según tu entorno"
    fi
fi

# Actualizar package.json si existe el nuevo
if [ -f "package.json.new" ]; then
    show_info "¿Quieres actualizar package.json con las nuevas configuraciones? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        cp package.json package.json.backup
        cp package.json.new package.json
        show_status "package.json actualizado (backup creado)"
        show_info "Reinstalando dependencias con la nueva configuración..."
        npm install
    fi
fi

# Actualizar vite.config.js si existe el nuevo
if [ -f "vite.config.js.new" ]; then
    show_info "¿Quieres actualizar vite.config.js con las nuevas configuraciones? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        if [ -f "vite.config.js" ]; then
            cp vite.config.js vite.config.js.backup
        fi
        cp vite.config.js.new vite.config.js
        show_status "vite.config.js actualizado"
    fi
fi

# 4. Crear directorios necesarios
echo ""
echo "📁 CREANDO DIRECTORIOS..."
echo "-------------------------"

# Crear carpeta de fotos si no existe
if [ ! -d "public/photos" ]; then
    mkdir -p public/photos
    show_status "Directorio public/photos creado"
fi

# Crear archivos de avatar por defecto
for i in {1..6}; do
    if [ ! -f "public/photos/avatar${i}.png" ]; then
        # Crear archivo SVG simple como avatar
        cat > "public/photos/avatar${i}.svg" << EOF
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="32" cy="32" r="32" fill="#$(printf '%02x%02x%02x' $((RANDOM%256)) $((RANDOM%256)) $((RANDOM%256)))"/>
<circle cx="32" cy="24" r="8" fill="white"/>
<path d="M16 56 C16 46 24 40 32 40 C40 40 48 46 48 56 L16 56 Z" fill="white"/>
<text x="32" y="36" text-anchor="middle" fill="white" font-size="12" font-weight="bold">A${i}</text>
</svg>
EOF
    fi
done

show_status "Avatares por defecto creados"

# 5. Verificar estructura del backend
echo ""
echo "🔧 VERIFICANDO BACKEND..."
echo "-------------------------"

if [ -d "backend" ]; then
    show_status "Directorio backend encontrado"
    
    # Verificar archivos principales
    backend_files=("config/database.php" "api/index.php" "classes/GameRoom.php" "install.sql")
    for file in "${backend_files[@]}"; do
        if [ -f "backend/$file" ]; then
            show_status "backend/$file ✓"
        else
            show_warning "backend/$file no encontrado"
        fi
    done
else
    show_warning "Directorio backend no encontrado - será necesario para el modo multijugador"
fi

# 6. Ejecutar pruebas básicas
echo ""
echo "🧪 EJECUTANDO PRUEBAS..."
echo "------------------------"

# Verificar que el proyecto compile
show_info "Verificando que el proyecto compile..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    show_status "El proyecto compila correctamente"
    # Limpiar build de prueba
    rm -rf dist
else
    show_warning "Hay problemas de compilación - revisar código"
fi

# 7. Mostrar resumen e instrucciones
echo ""
echo "🎊 CONFIGURACIÓN COMPLETADA"
echo "==========================="
echo ""
show_status "El proyecto está configurado y listo para usar"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "   🚀 DESARROLLO LOCAL:"
echo "      npm run dev              # Iniciar servidor de desarrollo"
echo "      http://localhost:5173   # Abrir en el navegador"
echo ""
echo "   🌐 PARA PRODUCCIÓN:"
echo "      npm run build           # Construir para producción"
echo "      # Subir 'dist/' como sitio web"
echo "      # Subir 'backend/' al servidor"
echo ""
echo "   🔧 CONFIGURAR BACKEND:"
echo "      1. Crear base de datos MySQL"
echo "      2. Editar backend/config/database.php"
echo "      3. Ejecutar backend/quick-setup.php"
echo "      4. Configurar src/utils/api.js con tu dominio"
echo ""
echo "   🧪 VERIFICAR FUNCIONAMIENTO:"
echo "      backend/test.php                    # Pruebas básicas"
echo "      backend/tests/complete-test.php     # Pruebas completas"
echo "      backend/index.php                   # Panel de admin"
echo ""
echo "📖 DOCUMENTACIÓN COMPLETA:"
echo "   README_MULTIJUGADOR.md     # Guía completa de funcionalidades"
echo "   INSTALL.md                 # Guía de instalación detallada"
echo "   DEPLOYMENT.md              # Guía para InfinityFree"
echo "   FINAL_CHECKLIST.md         # Lista de verificación"
echo ""

# Verificar si PHP está disponible para pruebas locales del backend
if command -v php >/dev/null 2>&1; then
    PHP_VERSION=$(php --version | head -n1)
    show_status "PHP encontrado: $PHP_VERSION"
    echo "   🔧 PRUEBAS LOCALES DEL BACKEND:"
    echo "      php -S localhost:8000 -t backend/   # Servidor PHP local"
    echo "      http://localhost:8000/test.php      # Pruebas del backend"
else
    show_warning "PHP no encontrado - necesario para el backend multijugador"
    echo "   📥 INSTALAR PHP:"
    echo "      Windows: https://windows.php.net/download/"
    echo "      macOS: brew install php"  
    echo "      Linux: sudo apt install php"
fi

echo ""
show_info "¡Configuración automática completada! 🎉"
show_info "El juego de cumpleaños multijugador está listo para usar."
echo ""