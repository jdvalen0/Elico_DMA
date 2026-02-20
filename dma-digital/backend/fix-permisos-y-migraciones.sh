#!/bin/bash

# Script para arreglar permisos y crear migraciones
# Ejecuta: bash fix-permisos-y-migraciones.sh

set -e

echo "🔧 Arreglando permisos y migraciones..."
echo ""

# Configurar variables
export DATABASE_URL="postgresql://dma_user:dma_pass@localhost:5433/dma_test_db"
export PGPASSWORD=postgres

echo "1. Otorgando permisos en schema public..."
# Usar PGPASSWORD para evitar pedir contraseña múltiples veces
PGPASSWORD=postgres sudo -u postgres psql -p 5433 -h localhost -d dma_test_db -c "GRANT ALL ON SCHEMA public TO dma_user;" 2>&1
PGPASSWORD=postgres sudo -u postgres psql -p 5433 -h localhost -d dma_test_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dma_user;" 2>&1
PGPASSWORD=postgres sudo -u postgres psql -p 5433 -h localhost -d dma_test_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dma_user;" 2>&1
PGPASSWORD=postgres sudo -u postgres psql -p 5433 -h localhost -d dma_test_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dma_user;" 2>&1
PGPASSWORD=postgres sudo -u postgres psql -p 5433 -h localhost -d dma_test_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dma_user;" 2>&1

echo "✅ Permisos otorgados"
echo ""

echo ""
echo "2. Verificando migraciones..."
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo "✅ Migraciones encontradas"
    echo "   Ejecutando migraciones..."
    npx prisma migrate deploy
else
    echo "⚠️  No hay migraciones. Creando esquema con db push..."
    npx prisma db push --accept-data-loss
    echo "✅ Esquema creado"
fi

echo ""
echo "3. Verificando conexión..."
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>&1 | head -3

echo ""
echo "✅ ¡Listo! Ahora puedes ejecutar: npm test"
