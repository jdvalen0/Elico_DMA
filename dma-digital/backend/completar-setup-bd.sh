#!/bin/bash

# Script para completar la configuración de la BD de pruebas
# Ejecuta este script si ya creaste el usuario pero falta la BD

echo "Completando configuración de base de datos de pruebas..."
echo ""

# Intentar crear la BD con diferentes métodos
echo "1. Intentando crear base de datos..."

# Método 1: Con PGPASSWORD
export PGPASSWORD=postgres
psql -p 5433 -h localhost -U postgres -c "CREATE DATABASE dma_test_db;" 2>/dev/null && echo "✅ BD creada con PGPASSWORD" || {

# Método 2: Con contraseña en línea
echo "2. Intentando método alternativo..."
psql -p 5433 -h localhost -U postgres -W -c "CREATE DATABASE dma_test_db;" << EOF
postgres
EOF
} && echo "✅ BD creada" || echo "⚠️  No se pudo crear automáticamente"

# Otorgar permisos
echo ""
echo "3. Otorgando permisos..."
export PGPASSWORD=postgres
psql -p 5433 -h localhost -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE dma_test_db TO dma_user;" 2>/dev/null && echo "✅ Permisos otorgados" || {
psql -p 5433 -h localhost -U postgres -W -c "GRANT ALL PRIVILEGES ON DATABASE dma_test_db TO dma_user;" << EOF
postgres
EOF
}

echo ""
echo "4. Verificando..."
psql -p 5433 -h localhost -U dma_user -d dma_test_db -c "SELECT 1;" 2>/dev/null && echo "✅ Conexión exitosa!" || echo "⚠️  Verifica la conexión manualmente"
