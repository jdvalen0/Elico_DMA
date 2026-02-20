#!/bin/bash

# Script para ejecutar una simulación completa del sistema DMA
# Incluye: Backend, simulación de datos, y acceso al frontend

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     SIMULACIÓN COMPLETA - DMA DIGITAL ELICO 4.0            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Ejecuta este script desde dma-digital/"
    exit 1
fi

# Configurar variables de entorno
export DATABASE_URL="postgresql://dma_user:dma_pass@localhost:5433/dma_test_db"
export JWT_SECRET="dev-secret"
export JWT_REFRESH_SECRET="dev-refresh-secret"
export NODE_ENV="development"

echo "📋 Paso 1: Verificando base de datos..."
psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1 && echo -e "${GREEN}✅ Base de datos conectada${NC}" || {
    echo -e "${YELLOW}⚠️  Base de datos no disponible. Configúrala primero.${NC}"
    exit 1
}

echo ""
echo "📋 Paso 2: Ejecutando simulación de evaluación..."
cd backend
npm run simulate

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Simulación completada${NC}"
    echo ""
    echo "📋 Paso 3: Iniciando servidor backend..."
    echo ""
    echo "El servidor se iniciará en http://localhost:3001"
    echo "Presiona Ctrl+C para detener"
    echo ""
    echo "📝 Credenciales de acceso:"
    echo "   Email: simulacion@dma.test"
    echo "   Password: admin123"
    echo ""
    echo "🌐 Frontend disponible en: http://localhost:3000"
    echo ""
    
    # Iniciar servidor
    npm run dev
else
    echo -e "${YELLOW}⚠️  Error en la simulación${NC}"
    exit 1
fi
