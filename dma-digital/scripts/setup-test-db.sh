#!/bin/bash

# Script para configurar la base de datos de pruebas
# Uso: ./scripts/setup-test-db.sh

set -e

echo "🗄️  Configurando base de datos de pruebas..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar si PostgreSQL está corriendo
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL no está instalado o no está en PATH${NC}"
    exit 1
fi

# Variables de entorno para la base de datos de prueba
DB_NAME="dma_test_db"
DB_USER="dma_user"
DB_PASSWORD="dma_pass"

echo "📝 Creando base de datos de prueba..."

# Crear base de datos si no existe
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}⚠️  La base de datos $DB_NAME ya existe${NC}"
    read -p "¿Deseas eliminarla y recrearla? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Eliminando base de datos existente..."
        psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
        psql -U postgres -c "CREATE DATABASE $DB_NAME;"
        echo -e "${GREEN}✅ Base de datos recreada${NC}"
    else
        echo -e "${YELLOW}⚠️  Usando base de datos existente${NC}"
    fi
else
    psql -U postgres -c "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}✅ Base de datos creada${NC}"
fi

# Ejecutar migraciones
echo ""
echo "🔄 Ejecutando migraciones..."
cd backend

# Configurar DATABASE_URL para pruebas
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

if [ -f "node_modules/.bin/prisma" ]; then
    npx prisma migrate deploy
    echo -e "${GREEN}✅ Migraciones aplicadas${NC}"
else
    echo -e "${YELLOW}⚠️  Prisma no está instalado. Ejecuta 'npm install' primero${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}✅ Base de datos de pruebas configurada correctamente${NC}"
echo ""
echo "📝 Variables de entorno para pruebas:"
echo "   DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
