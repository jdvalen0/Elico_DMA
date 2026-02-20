#!/bin/bash

# Script para ejecutar las pruebas del backend
# Ejecuta: bash ejecutar-pruebas.sh

set -e

echo "🧪 Configurando entorno para pruebas..."
echo ""

# Configurar variables de entorno
export DATABASE_URL="postgresql://dma_user:dma_pass@localhost:5433/dma_test_db"
export JWT_SECRET="test-secret"
export JWT_REFRESH_SECRET="test-refresh-secret"
export NODE_ENV="test"

echo "✅ Variables de entorno configuradas"
echo "   DATABASE_URL: postgresql://dma_user:***@localhost:5433/dma_test_db"
echo ""

# Verificar conexión
echo "🔍 Verificando conexión a la base de datos..."
psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1 && echo "✅ Conexión exitosa" || {
    echo "❌ Error de conexión. Verifica la configuración."
    exit 1
}

echo ""
echo "🔄 Ejecutando migraciones de Prisma..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migraciones aplicadas"
else
    echo "⚠️  Error en migraciones. Continuando de todas formas..."
fi

echo ""
echo "🧪 Ejecutando pruebas..."
echo ""

npm test
