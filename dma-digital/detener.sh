#!/bin/bash

# Script simple para detener Backend y Frontend
# Ejecuta: bash detener.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PID_FILE="$SCRIPT_DIR/backend.pid"
BACKEND_PORT=3001

echo "🛑 Deteniendo sistema DMA Digital ELICO 4.0..."
echo ""

# Detener backend usando PID guardado
if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "🛑 Deteniendo backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        sleep 2
        # Si aún está corriendo, forzar
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null || true
        fi
        echo "✅ Backend detenido"
    else
        echo "⚠️  Backend no estaba corriendo (PID: $BACKEND_PID)"
    fi
    rm -f "$BACKEND_PID_FILE"
else
    echo "⚠️  Archivo backend.pid no encontrado"
fi

# Detener cualquier proceso en el puerto 3001
if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
    echo "🛑 Deteniendo procesos en puerto $BACKEND_PORT..."
    lsof -ti :$BACKEND_PORT | xargs kill -9 2>/dev/null || true
    echo "✅ Procesos en puerto $BACKEND_PORT detenidos"
fi

# Detener procesos de vite preview
if pgrep -f "vite preview" > /dev/null; then
    echo "🛑 Deteniendo frontend (vite preview)..."
    pkill -f "vite preview" || true
    sleep 1
    pkill -9 -f "vite preview" || true
    echo "✅ Frontend detenido"
fi

echo ""
echo "✅ Sistema detenido completamente"
echo ""
