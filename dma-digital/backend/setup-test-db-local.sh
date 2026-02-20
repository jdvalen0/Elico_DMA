#!/bin/bash

# Script para configurar base de datos de pruebas localmente
# Uso: ./setup-test-db-local.sh

set -e

echo "🗄️  Configurando base de datos de pruebas local..."
echo ""

DB_NAME="dma_test_db"
DB_USER="dma_user"
DB_PASSWORD="dma_pass"

# Intentar diferentes métodos de conexión
echo "📝 Intentando crear base de datos..."

# Método 1: Con usuario postgres (requiere contraseña o peer auth)
if psql -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "⚠️  La base de datos $DB_NAME ya existe"
    read -p "¿Deseas eliminarla y recrearla? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
        psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
    fi
else
    # Intentar crear con diferentes métodos
    psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || \
    psql postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || \
    echo "⚠️  No se pudo crear automáticamente. Ejecuta manualmente:"
    echo "   psql -U postgres -c 'CREATE DATABASE $DB_NAME;'"
    echo "   O: sudo -u postgres psql -c 'CREATE DATABASE $DB_NAME;'"
fi

# Verificar si el usuario existe y crearlo si no
echo ""
echo "👤 Verificando usuario $DB_USER..."
psql -U postgres -c "SELECT 1 FROM pg_user WHERE usename='$DB_USER';" 2>/dev/null | grep -q 1 || {
    echo "📝 Creando usuario $DB_USER..."
    psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || \
    psql postgres -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || \
    echo "⚠️  No se pudo crear el usuario automáticamente"
}

# Dar permisos
echo "🔐 Otorgando permisos..."
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || \
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || \
echo "⚠️  No se pudieron otorgar permisos automáticamente"

echo ""
echo "✅ Configuración completada"
echo ""
echo "📝 Variables de entorno para pruebas:"
echo "   export DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME\""
echo "   export JWT_SECRET=\"test-secret\""
echo "   export JWT_REFRESH_SECRET=\"test-refresh-secret\""
