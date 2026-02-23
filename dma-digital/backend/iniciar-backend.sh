#!/bin/bash

# Script para iniciar el backend correctamente
# Ejecuta: bash iniciar-backend.sh

set -e

echo "🚀 Iniciando backend DMA..."
echo ""

# Configurar variables de entorno (respeta DATABASE_URL o DB_PORT si ya están definidos)
DB_PORT="${DB_PORT:-5433}"
[ -z "$DATABASE_URL" ] && export DATABASE_URL="postgresql://dma_user:dma_pass@localhost:${DB_PORT}/dma_test_db"
export JWT_SECRET="dev-secret"
export JWT_REFRESH_SECRET="dev-refresh-secret"
export PORT=3001
export NODE_ENV="development"

echo "📝 Variables configuradas:"
echo "   DATABASE_URL: postgresql://dma_user:***@localhost:5433/dma_test_db"
echo "   PORT: 3001"
echo ""

# Verificar conexión a BD
echo "🔍 Verificando conexión a base de datos..."
psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1 && echo "✅ Base de datos conectada" || {
    echo "❌ Error de conexión a la base de datos"
    exit 1
}

echo ""
echo "🚀 Iniciando servidor..."
echo "   Backend disponible en: http://localhost:3001"
echo "   API disponible en: http://localhost:3001/api"
echo ""
echo "Presiona Ctrl+C para detener"
echo ""

# Iniciar servidor
npx tsx src/index.ts
