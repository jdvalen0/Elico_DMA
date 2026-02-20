#!/bin/bash

# Método simple: usar db push directamente (más fácil para pruebas)

set -e

echo "🔧 Configuración simple para pruebas..."
echo ""

export DATABASE_URL="postgresql://dma_user:dma_pass@localhost:5433/dma_test_db"
export JWT_SECRET="test-secret"
export JWT_REFRESH_SECRET="test-refresh-secret"

echo "1. Creando esquema con Prisma db push..."
npx prisma db push --accept-data-loss --skip-generate

if [ $? -eq 0 ]; then
    echo "✅ Esquema creado exitosamente"
else
    echo "⚠️  Puede que necesites permisos. Ejecuta primero:"
    echo "   export PGPASSWORD=postgres"
    echo "   sudo -u postgres psql -p 5433 -h localhost -d dma_test_db -c \"GRANT ALL ON SCHEMA public TO dma_user;\""
    exit 1
fi

echo ""
echo "2. Verificando..."
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>&1 | head -3

echo ""
echo "✅ ¡Listo! Ahora ejecuta: npm test"
