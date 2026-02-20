#!/bin/bash

# Script para ejecutar todas las pruebas del proyecto
# Uso: ./scripts/test-all.sh

set -e

echo "🧪 Ejecutando todas las pruebas del proyecto DMA Digital ELICO 4.0"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependencias
echo "📦 Verificando dependencias..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencias verificadas${NC}"
echo ""

# Backend tests
echo "🔧 Ejecutando pruebas del backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias del backend..."
    npm install
fi

echo "🧪 Ejecutando pruebas unitarias..."
if npm run test:unit; then
    echo -e "${GREEN}✅ Pruebas unitarias del backend pasaron${NC}"
else
    echo -e "${RED}❌ Pruebas unitarias del backend fallaron${NC}"
    exit 1
fi

echo ""
echo "🧪 Ejecutando pruebas de integración..."
if npm run test:integration; then
    echo -e "${GREEN}✅ Pruebas de integración del backend pasaron${NC}"
else
    echo -e "${RED}❌ Pruebas de integración del backend fallaron${NC}"
    exit 1
fi

cd ..

# Frontend tests
echo ""
echo "🎨 Ejecutando pruebas del frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependencias del frontend..."
    npm install
fi

echo "🧪 Ejecutando pruebas del frontend..."
if npm run test:run; then
    echo -e "${GREEN}✅ Pruebas del frontend pasaron${NC}"
else
    echo -e "${RED}❌ Pruebas del frontend fallaron${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}🎉 ¡Todas las pruebas pasaron exitosamente!${NC}"
echo ""
echo "📊 Para ver cobertura detallada:"
echo "   Backend:  cd backend && npm run test:coverage"
echo "   Frontend: cd frontend && npm run test:coverage"
