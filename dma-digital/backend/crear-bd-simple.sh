#!/bin/bash

# Script simple para crear la BD usando la contraseña que ya funciona
# Ejecuta: bash crear-bd-simple.sh

echo "Creando base de datos de pruebas..."
echo ""

# Usar PGPASSWORD para evitar pedir contraseña
export PGPASSWORD=postgres

echo "1. Creando base de datos..."
sudo -u postgres psql -p 5433 -h localhost -c "CREATE DATABASE dma_test_db;" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Base de datos creada"
else
    echo "⚠️  La BD puede que ya exista o hubo un error"
fi

echo ""
echo "2. Otorgando permisos..."
sudo -u postgres psql -p 5433 -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE dma_test_db TO dma_user;" 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Permisos otorgados"
else
    echo "⚠️  Error al otorgar permisos"
fi

echo ""
echo "3. Verificando..."
psql -p 5433 -h localhost -U dma_user -d dma_test_db -c "SELECT 1;" 2>&1 | head -3

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Todo listo! La base de datos está configurada."
    echo ""
    echo "Ahora puedes ejecutar:"
    echo "  export DATABASE_URL=\"postgresql://dma_user:dma_pass@localhost:5433/dma_test_db\""
    echo "  export JWT_SECRET=\"test-secret\""
    echo "  export JWT_REFRESH_SECRET=\"test-refresh-secret\""
    echo "  npx prisma migrate deploy"
    echo "  npm test"
else
    echo "⚠️  Verifica la conexión manualmente"
fi
