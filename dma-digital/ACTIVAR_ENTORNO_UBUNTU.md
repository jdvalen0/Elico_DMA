# Activar entorno de trabajo – Ubuntu / nueva máquina

Este proyecto **no usa Python ni `venv`**. Stack: **Node.js** (backend + frontend), **PostgreSQL**.

---

## 1. Por qué falló lo que hiciste

| Comando / paso | Motivo del fallo |
|----------------|-------------------|
| `bash arrancar.sh` desde `~/Escritorio/Elico_DMA` | `arrancar.sh` está en **dma-digital/**; desde la raíz no existe en el directorio actual. |
| `soure venv/bin/activate` | Typo: es `source`, no `soure`. |
| `source venv/bin/activate` | No hay `venv`: el proyecto es Node.js, no Python. |

---

## 2. Requisitos en la nueva máquina

- **Node.js 18+** y **npm**
- **PostgreSQL 15+** (servicio corriendo)
- **psql** (cliente)
- **curl**, **lsof** (para los scripts de arranque)

Comprobar:

```bash
node -v   # v18.x o superior
npm -v
psql --version
curl -V
lsof -v  # o que exista el comando
```

---

## 3. PostgreSQL para desarrollo nativo

Los scripts (`arrancar.sh`, `iniciar-backend.sh`) esperan:

- **Puerto:** 5433  
- **Usuario:** `dma_user`  
- **Contraseña:** `dma_pass`  
- **Base de datos:** `dma_test_db`

Si PostgreSQL va en otro puerto (p. ej. 5432), inicia el servidor en 5433 o cambia en los scripts la URL (variable `DATABASE_URL`).

Crear usuario y base de datos (ejemplo con puerto 5433):

```bash
sudo -u postgres psql -p 5433 << 'EOF'
CREATE USER dma_user WITH PASSWORD 'dma_pass';
CREATE DATABASE dma_test_db OWNER dma_user;
GRANT ALL PRIVILEGES ON DATABASE dma_test_db TO dma_user;
\c dma_test_db
GRANT ALL ON SCHEMA public TO dma_user;
EOF
```

Si tu instalación usa el puerto por defecto 5432:

```bash
sudo -u postgres psql -p 5432 -c "CREATE USER dma_user WITH PASSWORD 'dma_pass';"
sudo -u postgres psql -p 5432 -c "CREATE DATABASE dma_test_db OWNER dma_user;"
sudo -u postgres psql -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE dma_test_db TO dma_user;"
```

Luego tendrás que ajustar los scripts para usar `localhost:5432` en lugar de `5433`, o levantar PostgreSQL en 5433.

Comprobar conexión:

```bash
psql "postgresql://dma_user:dma_pass@localhost:5433/dma_test_db" -c "SELECT 1;"
```

---

## 4. Primera vez: instalar dependencias y DB

Desde la **raíz del repo** (`~/Escritorio/Elico_DMA`):

```bash
cd dma-digital

# Backend
cd backend
npm install
npx prisma generate
export DATABASE_URL="postgresql://dma_user:dma_pass@localhost:5433/dma_test_db"
npx prisma db push
npm run create-user admin@elico.com admin123
cd ..

# Frontend
cd frontend
npm install
cd ..
```

---

## 5. Arrancar el sistema

**Opción A – Desde la raíz del repo** (recomendado si quieres un solo comando desde `Elico_DMA`):

```bash
cd ~/Escritorio/Elico_DMA
bash arrancar.sh
```

**Opción B – Desde dma-digital**:

```bash
cd ~/Escritorio/Elico_DMA/dma-digital
bash arrancar.sh
```

El script:

1. Comprueba conexión a PostgreSQL (puerto 5433, `dma_test_db`).
2. Inicia el backend en segundo plano (puerto 3001).
3. Espera a que `/health` responda.
4. Hace `npm run build && npm run preview` del frontend (puerto 4173 u otro que indique Vite).

Para detener:

```bash
cd ~/Escritorio/Elico_DMA/dma-digital
bash detener.sh
```

---

## 6. Resumen rápido (ya con DB y deps instaladas)

```bash
cd ~/Escritorio/Elico_DMA
bash arrancar.sh
```

No uses `venv` ni `source venv/bin/activate` en este proyecto.
