#!/bin/bash

# Script alternativo para crear BD sin necesidad de contraseña de postgres
# Si tu usuario tiene permisos para crear bases de datos

echo "Intentando crear base de datos sin contraseña de postgres..."
echo ""

# Intentar con tu usuario actual (puede funcionar si tienes permisos)
psql -p 5433 -h localhost -d postgres << EOF
CREATE DATABASE dma_test_db;
CREATE USER dma_user WITH PASSWORD 'dma_pass';
GRANT ALL PRIVILEGES ON DATABASE dma_test_db TO dma_user;
\q
EOF

if [ $? -eq 0 ]; then
    echo "✅ Base de datos creada exitosamente!"
else
    echo "❌ No se pudo crear. Necesitas la contraseña de postgres."
    echo ""
    echo "OPCIÓN: Establecer contraseña de postgres primero:"
    echo "  sudo passwd postgres  # Establecer contraseña del usuario del sistema"
    echo "  O usar: sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'tu_contraseña';\""
fi
