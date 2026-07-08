#!/bin/bash

# Script simple para arrancar Backend y Frontend
# Ejecuta: bash arrancar.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
BACKEND_PORT=3001
DB_PORT="${DB_PORT:-5433}"
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://dma_user:dma_pass@localhost:${DB_PORT}/dma_test_db"
fi

echo "🚀 Arrancando sistema DMA Digital ELICO 4.0..."
echo ""

# Si ya corre con Docker Compose, no hace falta arrancar nativo
if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx 'dma-backend' \
   && docker ps --format '{{.Names}}' 2>/dev/null | grep -qx 'dma-frontend'; then
    echo "ℹ️  Docker Compose ya tiene backend y frontend activos."
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:3001/health"
    echo ""
    echo "   Para modo nativo (sin Docker), primero ejecuta:"
    echo "   docker compose down"
    exit 0
fi

if ! command -v psql > /dev/null 2>&1; then
    echo "❌ Error: falta el cliente psql (postgresql-client)"
    echo "   Ubuntu/Debian: sudo apt install postgresql-client"
    echo ""
    echo "   Alternativa con Docker (sin arrancar.sh):"
    echo "   cd $SCRIPT_DIR && docker compose up -d"
    echo "   Luego abre http://localhost:3000"
    exit 1
fi

# Verificar base de datos
echo "🔍 Verificando base de datos..."
if ! psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Error: No se puede conectar a la base de datos"
    echo "   URL: $DATABASE_URL"
    echo "   Si PostgreSQL va en 5432: DB_PORT=5432 bash arrancar.sh"
    exit 1
fi
echo "✅ Base de datos conectada"
echo ""

# Verificar si el backend ya está corriendo
if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
    echo "⚠️  El puerto $BACKEND_PORT ya está en uso"
    read -p "¿Deseas detener el proceso existente y continuar? (y/n): " confirm
    if [[ $confirm == "y" ]]; then
        echo "🛑 Deteniendo proceso en puerto $BACKEND_PORT..."
        lsof -ti :$BACKEND_PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        echo "Operación cancelada"
        exit 0
    fi
fi

# Configurar variables de entorno (DATABASE_URL ya definida arriba si no existía)
export JWT_SECRET="dev-secret"
export JWT_REFRESH_SECRET="dev-refresh-secret"
export PORT=$BACKEND_PORT
export NODE_ENV="development"
export MINIO_ENABLED="false"

# Iniciar Backend en background
echo "📦 Iniciando Backend..."
cd "$BACKEND_DIR"
nohup bash iniciar-backend.sh > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid
echo "   Backend iniciado (PID: $BACKEND_PID)"
echo ""

# Esperar a que el backend esté listo
echo "⏳ Esperando a que el backend esté listo..."
MAX_WAIT=30
WAIT_COUNT=0
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if curl -s http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
        echo "✅ Backend respondiendo en http://localhost:$BACKEND_PORT"
        break
    fi
    WAIT_COUNT=$((WAIT_COUNT + 1))
    echo -n "."
    sleep 1
done
echo ""

if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    echo "❌ El backend no respondió a tiempo"
    echo "   Revisa los logs: tail -f $SCRIPT_DIR/backend.log"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Iniciar Frontend
echo "📦 Iniciando Frontend..."
cd "$FRONTEND_DIR"
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     ✅ SISTEMA ARRANCADO                                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🔗 Backend:  http://localhost:$BACKEND_PORT"
echo "🔗 Frontend: http://localhost:4173 (o el puerto que indique Vite)"
echo ""
echo "📋 Para detener el sistema:"
echo "   bash detener.sh"
echo ""
echo "📝 Logs del backend: tail -f $SCRIPT_DIR/backend.log"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

npm run build && npm run preview
