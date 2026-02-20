#!/bin/bash

# Script para arrancar el sistema DMA Digital ELICO 4.0 completo
# Uso: bash arrancar-sistema.sh

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🚀 ARRANQUE DEL SISTEMA DMA DIGITAL ELICO 4.0            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para verificar comando
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 no está instalado${NC}"
        exit 1
    fi
}

# Verificar prerequisitos
echo "🔍 Verificando prerequisitos..."
check_command node
check_command npm
check_command psql
echo -e "${GREEN}✅ Prerequisitos OK${NC}"
echo ""

# Verificar base de datos
echo "🔍 Verificando base de datos..."
if psql "postgresql://dma_user:dma_pass@localhost:5433/dma_test_db" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Base de datos conectada${NC}"
else
    echo -e "${YELLOW}⚠️  Base de datos no disponible. Asegúrate de que PostgreSQL esté corriendo en puerto 5433${NC}"
    echo "   Usuario: dma_user"
    echo "   Base de datos: dma_test_db"
    read -p "¿Continuar de todos modos? (s/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi
echo ""

# Verificar puertos
echo "🔍 Verificando puertos..."
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Puerto 3001 ya está en uso (backend puede estar corriendo)${NC}"
else
    echo -e "${GREEN}✅ Puerto 3001 disponible${NC}"
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Puerto 3000 ya está en uso (frontend dev puede estar corriendo)${NC}"
else
    echo -e "${GREEN}✅ Puerto 3000 disponible${NC}"
fi
echo ""

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"

# Función para iniciar backend
start_backend() {
    echo "🚀 Iniciando backend..."
    cd "$BACKEND_DIR"
    
    # Verificar dependencias
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependencias del backend..."
        npm install
    fi
    
    # Verificar esquema de BD
    echo "🔧 Verificando esquema de base de datos..."
    npx prisma generate
    npx prisma db push --accept-data-loss || true
    
    # Configurar variables de entorno
    export DATABASE_URL="postgresql://dma_user:dma_pass@localhost:5433/dma_test_db"
    export JWT_SECRET="dev-secret"
    export JWT_REFRESH_SECRET="dev-refresh-secret"
    export PORT=3001
    export NODE_ENV="development"
    export MINIO_ENABLED="false"
    
    echo ""
    echo "📝 Variables configuradas:"
    echo "   DATABASE_URL: postgresql://dma_user:***@localhost:5433/dma_test_db"
    echo "   PORT: 3001"
    echo ""
    
    # Iniciar en background
    echo "🚀 Iniciando servidor backend en segundo plano..."
    nohup bash iniciar-backend.sh > backend.log 2>&1 &
    BACKEND_PID=$!
    echo "   PID: $BACKEND_PID"
    echo "   Log: $BACKEND_DIR/backend.log"
    
    # Esperar a que esté listo
    echo "⏳ Esperando a que el backend esté listo..."
    for i in {1..30}; do
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend listo en http://localhost:3001${NC}"
            break
        fi
        sleep 1
    done
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend no respondió después de 30 segundos${NC}"
        echo "   Revisa los logs: tail -f $BACKEND_DIR/backend.log"
        exit 1
    fi
}

# Función para iniciar frontend
start_frontend() {
    echo ""
    echo "🚀 Iniciando frontend..."
    cd "$FRONTEND_DIR"
    
    # Verificar dependencias
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependencias del frontend..."
        npm install
    fi
    
    # Preguntar modo
    echo ""
    echo "¿Qué modo deseas usar?"
    echo "1) Desarrollo (hot-reload) - Puerto 3000"
    echo "2) Preview (producción) - Puerto 4173"
    read -p "Selecciona (1 o 2): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[1]$ ]]; then
        echo "🚀 Iniciando frontend en modo desarrollo..."
        echo "   URL: http://localhost:3000"
        echo ""
        echo "⚠️  El backend debe estar corriendo en http://localhost:3001"
        echo ""
        npm run dev
    else
        echo "🔨 Construyendo frontend..."
        npm run build
        
        echo ""
        echo "🚀 Iniciando frontend en modo preview..."
        echo "   URL: http://localhost:4173 (o el puerto que indique)"
        echo ""
        npm run preview
    fi
}

# Menú principal
echo "¿Qué deseas hacer?"
echo "1) Iniciar solo backend"
echo "2) Iniciar solo frontend"
echo "3) Iniciar backend y frontend"
read -p "Selecciona (1, 2 o 3): " -n 1 -r
echo
echo ""

case $REPLY in
    1)
        start_backend
        echo ""
        echo "✅ Backend iniciado. Para detener: kill $BACKEND_PID"
        ;;
    2)
        start_frontend
        ;;
    3)
        start_backend
        start_frontend
        ;;
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
        ;;
esac

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     ✅ SISTEMA INICIADO                                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📚 Documentación:"
echo "   - Auditoría completa: AUDITORIA_COMPLETA_Y_ARRANQUE.md"
echo "   - Guía de uso: GUIA_USO_E_INTERPRETACION.md"
echo "   - Fundamentación: FUNDAMENTACION_CIENTIFICA.md"
echo ""
