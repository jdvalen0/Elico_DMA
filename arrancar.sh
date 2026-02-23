#!/bin/bash
# Redirige al script de arranque dentro de dma-digital.
# Ejecutar desde la raíz del repo: bash arrancar.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/dma-digital" || exit 1
exec bash arrancar.sh "$@"
