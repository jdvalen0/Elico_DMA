# Instalación en Windows - DMA Digital ELICO 4.0

## Requisitos Previos

### Opción 1: Docker Desktop (Recomendado)

1. **Instalar Docker Desktop para Windows**
   - Descarga: https://www.docker.com/products/docker-desktop
   - Requiere Windows 10/11 64-bit con WSL2
   - Sigue el asistente de instalación

2. **Verificar instalación**
   ```powershell
   docker --version
   docker-compose --version
   ```

### Opción 2: Instalación Nativa

1. **Node.js 18+**
   - Descarga: https://nodejs.org/
   - Instala la versión LTS

2. **PostgreSQL 15+**
   - Descarga: https://www.postgresql.org/download/windows/
   - O usa Docker para PostgreSQL

3. **Git**
   - Descarga: https://git-scm.com/download/win

---

## Instalación con Docker (Recomendado)

### 1. Clonar o Descargar el Proyecto

```powershell
# Si tienes Git
git clone <repository-url>
cd dma-digital

# O descarga el ZIP y extrae
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
POSTGRES_PORT=5432

# Backend
JWT_SECRET=tu-secret-key-cambiar-en-produccion
JWT_REFRESH_SECRET=tu-refresh-secret-cambiar-en-produccion
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3001/api

# Opcional
MINIO_ENABLED=false
```

### 3. Iniciar con Docker Compose

```powershell
# En PowerShell o CMD
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 4. Configurar Base de Datos

```powershell
# Ejecutar migraciones
docker-compose exec backend npx prisma migrate deploy

# Crear usuario inicial
docker-compose exec backend npm run create-user admin@elico.com admin123
```

### 5. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432

---

## Instalación Nativa (Sin Docker)

### 1. Backend

```powershell
cd backend
npm install

# Configurar .env
# DATABASE_URL=postgresql://user:pass@localhost:5432/dma_db
# JWT_SECRET=secret
# JWT_REFRESH_SECRET=refresh-secret

# Generar Prisma
npx prisma generate

# Migrar BD
npx prisma migrate deploy

# Iniciar
npm run dev
```

### 2. Frontend

```powershell
cd frontend
npm install

# Configurar .env
# VITE_API_URL=http://localhost:3001/api

# Iniciar
npm run dev
```

---

## Solución de Problemas en Windows

### Error: WSL2 no está habilitado

1. Abre PowerShell como Administrador
2. Ejecuta:
   ```powershell
   wsl --install
   ```
3. Reinicia el equipo
4. Instala Docker Desktop

### Error: Puerto ya en uso

```powershell
# Ver qué usa el puerto
netstat -ano | findstr :3001

# Matar proceso (reemplaza PID)
taskkill /PID <PID> /F
```

### Error: Permisos de Docker

1. Abre Docker Desktop
2. Settings → General
3. Marca "Use the WSL 2 based engine"

### Error: Variables de entorno no se leen

En Windows, usa archivo `.env` o configura en PowerShell:
```powershell
$env:DATABASE_URL="postgresql://user:pass@localhost:5432/db"
```

---

## Comandos Útiles

```powershell
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar un servicio
docker-compose restart backend

# Ejecutar comando en contenedor
docker-compose exec backend npm run simulate

# Limpiar todo (cuidado: borra datos)
docker-compose down -v
```

---

## Verificación

1. **Backend funcionando**:
   ```powershell
   curl http://localhost:3001/health
   ```

2. **Frontend funcionando**:
   - Abre http://localhost:3000 en el navegador

3. **Base de datos**:
   ```powershell
   docker-compose exec postgres psql -U dma_user -d dma_db -c "SELECT 1;"
   ```

---

## Próximos Pasos

1. Accede a http://localhost:3000
2. Inicia sesión con las credenciales creadas
3. Crea tu primera evaluación
4. Consulta la [Guía de Uso](./GUIA_USO_E_INTERPRETACION.md)

---

**Nota**: Si tienes problemas, verifica que Docker Desktop esté corriendo y que los puertos no estén ocupados.
