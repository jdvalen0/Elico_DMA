# Arquitectura Técnica - DMA Digital ELICO 4.0

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026  
**Estado**: Sistema funcional y estable

---

## Índice

1. [Arquitectura General](#arquitectura-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura de Software](#arquitectura-de-software)
4. [Base de Datos](#base-de-datos)
5. [Seguridad](#seguridad)
6. [Despliegue y Portabilidad](#despliegue-y-portabilidad)
7. [Mejores Prácticas Implementadas](#mejores-prácticas-implementadas)
8. [Problemas Resueltos y Lecciones Aprendidas](#problemas-resueltos-y-lecciones-aprendidas)
9. [Instrucciones de Arranque](#instrucciones-de-arranque)

---

## Arquitectura General

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript (PWA)                        │  │
│  │  - Material-UI                                      │  │
│  │  - Redux Toolkit (Estado)                          │  │
│  │  - React Query (Data Fetching)                     │  │
│  │  - Dexie (IndexedDB - Offline)                      │  │
│  │  - Vite (Build Tool)                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js + TypeScript                            │  │
│  │  - JWT Authentication                               │  │
│  │  - Zod Validation                                   │  │
│  │  - Prisma ORM                                       │  │
│  │  - Error Handling                                   │  │
│  │  - Graceful Shutdown                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │   Redis      │  │   MinIO      │
│ (Principal)  │  │  (Cache)     │  │  (Archivos)  │
│              │  │  (Opcional)  │  │  (Opcional)  │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Principios Arquitectónicos

1. **Separación de Responsabilidades**: Frontend, Backend y Base de Datos claramente separados
2. **API RESTful**: Comunicación mediante REST API estándar
3. **Stateless**: Backend sin estado, autenticación mediante JWT
4. **Multi-tenant**: Aislamiento de datos por organización (`tenantId`)
5. **Offline-First**: Frontend funciona sin conexión, sincroniza después
6. **Resiliencia**: Manejo robusto de errores, graceful shutdown, circuit breakers

---

## Stack Tecnológico

### Frontend

| Tecnología | Versión | Propósito | Estado |
|------------|---------|-----------|--------|
| **React** | 18.x | Framework UI | ✅ Implementado |
| **TypeScript** | 5.x | Tipado estático | ✅ Implementado |
| **Material-UI (MUI)** | 5.x | Componentes UI | ✅ Implementado |
| **Redux Toolkit** | 2.x | Gestión de estado global | ✅ Implementado |
| **React Query** | 5.x | Data fetching y cache | ✅ Implementado |
| **Recharts** | 2.x | Gráficos y visualizaciones | ✅ Implementado |
| **Dexie** | 3.x | IndexedDB para offline | ✅ Implementado |
| **Vite** | 5.x | Build tool y dev server | ✅ Implementado |
| **Vitest** | 1.x | Testing framework | ✅ Configurado |

**Justificación**:
- **React 18**: Framework maduro, gran ecosistema, excelente rendimiento
- **TypeScript**: Tipado estático reduce errores, mejora mantenibilidad
- **Material-UI**: Componentes profesionales, accesibilidad, tema consistente
- **Redux Toolkit**: Estado predecible, DevTools, middleware
- **React Query**: Cache automático, sincronización, optimistic updates
- **Dexie**: API simple para IndexedDB, soporte offline robusto
- **Vite**: Build rápido, HMR excelente, optimización automática

### Backend

| Tecnología | Versión | Propósito | Estado |
|------------|---------|-----------|--------|
| **Node.js** | 18+ | Runtime JavaScript | ✅ Implementado |
| **Express.js** | 4.x | Framework web | ✅ Implementado |
| **TypeScript** | 5.x | Tipado estático | ✅ Implementado |
| **Prisma** | 5.x | ORM y migraciones | ✅ Implementado |
| **PostgreSQL** | 15+ | Base de datos relacional | ✅ Implementado |
| **JWT** | 9.x | Autenticación | ✅ Implementado |
| **Zod** | 3.x | Validación de esquemas | ✅ Implementado |
| **bcryptjs** | 2.x | Hashing de contraseñas | ✅ Implementado |
| **Jest** | 29.x | Testing framework | ✅ Configurado |
| **MinIO** | 7.x | Almacenamiento de archivos (opcional) | ✅ Opcional |
| **PDFKit** | 1.x | Generación de PDFs | ✅ Implementado |
| **tsx** | 4.x | TypeScript execution | ✅ Implementado |

**Justificación**:
- **Node.js + Express**: Ecosistema maduro, alto rendimiento, fácil despliegue
- **Prisma**: Type-safe queries, migraciones automáticas, excelente DX
- **PostgreSQL**: ACID, relaciones complejas, JSON support, escalable
- **JWT**: Stateless auth, escalable, estándar de industria
- **Zod**: Validación runtime, type inference, error messages claros
- **tsx**: Ejecución directa de TypeScript sin compilación previa

### Infraestructura

| Tecnología | Propósito | Estado |
|------------|-----------|--------|
| **Docker** | Containerización | ✅ Configurado |
| **Docker Compose** | Orquestación local | ✅ Configurado |
| **PostgreSQL** | Base de datos | ✅ Implementado |
| **Redis** | Cache (opcional) | ⚠️ Opcional |
| **MinIO** | Almacenamiento S3-compatible (opcional) | ⚠️ Opcional |
| **Nginx** | Reverse proxy (producción) | 📋 Pendiente |

---

## Arquitectura de Software

### Patrón de Arquitectura

**Arquitectura en Capas (Layered Architecture)**

```
┌─────────────────────────────────────┐
│      Presentation Layer             │
│  (React Components, Pages)         │
└─────────────────────────────────────┘
                  │
┌─────────────────────────────────────┐
│      Application Layer              │
│  (Services, State Management)       │
└─────────────────────────────────────┘
                  │
┌─────────────────────────────────────┐
│      API Layer                      │
│  (REST Endpoints, Controllers)      │
└─────────────────────────────────────┘
                  │
┌─────────────────────────────────────┐
│      Business Logic Layer           │
│  (Services, Domain Logic)           │
└─────────────────────────────────────┘
                  │
┌─────────────────────────────────────┐
│      Data Access Layer              │
│  (Prisma, Database)                 │
└─────────────────────────────────────┘
```

### Estructura del Código

#### Backend

```
backend/
├── src/
│   ├── controllers/      # Controladores (HTTP handlers)
│   │   ├── auth.ts
│   │   ├── evaluations.ts
│   │   ├── responses.ts
│   │   ├── evidence.ts
│   │   ├── maturity.ts
│   │   ├── roadmap.ts
│   │   ├── reports.ts
│   │   └── benchmark.ts
│   ├── services/         # Lógica de negocio
│   │   ├── maturityCalculator.ts
│   │   ├── coherenceValidator.ts
│   │   ├── roadmapGenerator.ts
│   │   ├── pdfGenerator.ts
│   │   ├── dimensions.ts
│   │   └── storage.ts
│   ├── routes/           # Definición de rutas
│   │   ├── auth.ts
│   │   ├── evaluations.ts
│   │   ├── responses.ts
│   │   ├── evidence.ts
│   │   ├── maturity.ts
│   │   ├── roadmap.ts
│   │   ├── reports.ts
│   │   └── benchmark.ts
│   ├── middleware/       # Middleware (auth, errors)
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── __tests__/        # Pruebas
│   │   ├── unit/
│   │   ├── integration/
│   │   └── setup.ts
│   └── index.ts          # Entry point
├── prisma/
│   ├── schema.prisma     # Schema de BD
│   └── migrations/       # Migraciones
└── scripts/              # Scripts de utilidad
    ├── create-user.ts
    └── simular-evaluacion-dma.ts
```

**Principios**:
- **Controllers**: Solo manejan HTTP, delegan a services
- **Services**: Contienen lógica de negocio, son reutilizables
- **Routes**: Definen endpoints, aplican middleware
- **Middleware**: Cross-cutting concerns (auth, errors, logging)

#### Frontend

```
frontend/
├── src/
│   ├── pages/            # Páginas principales
│   │   ├── LoginPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── CreateEvaluationPage.tsx
│   │   ├── EvaluationPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── DashboardListPage.tsx
│   │   ├── EvidencePage.tsx
│   │   ├── EvidenceListPage.tsx
│   │   └── ReportsPage.tsx
│   ├── components/       # Componentes reutilizables
│   │   ├── Layout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── DimensionForm.tsx
│   │   ├── RoadmapView.tsx
│   │   ├── OfflineIndicator.tsx
│   │   └── RouteDebugger.tsx
│   ├── services/         # Servicios API
│   │   ├── api.ts
│   │   └── offline.ts
│   ├── store/           # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   └── evaluationSlice.ts
│   │   └── index.ts
│   ├── hooks/           # Custom hooks
│   │   └── useOfflineSync.ts
│   └── __tests__/       # Pruebas
│       └── components/
```

**Principios**:
- **Pages**: Componentes de nivel superior, rutas
- **Components**: Reutilizables, presentacionales
- **Services**: Comunicación con API
- **Store**: Estado global compartido
- **Hooks**: Lógica reutilizable

### Patrones de Diseño Implementados

1. **Repository Pattern**: Prisma abstrae acceso a datos
2. **Service Layer**: Lógica de negocio separada de controllers
3. **Middleware Pattern**: Autenticación, validación, errores
4. **Observer Pattern**: Redux para estado reactivo
5. **Factory Pattern**: Creación de objetos complejos (evaluaciones, roadmaps)
6. **Strategy Pattern**: Diferentes algoritmos de cálculo según contexto
7. **Circuit Breaker Pattern**: Implementado en polling de reportes (frontend)

---

## Base de Datos

### Esquema Principal

**Entidades Principales**:

```
Tenant (Organización)
  ├── User (Usuarios)
  └── Evaluation (Evaluaciones)
        ├── Dimension (12 dimensiones)
        │     └── Subcriterion (Subcriterios)
        ├── Response (Respuestas)
        ├── Evidence (Evidencias)
        └── Roadmap (Roadmap generado)
```

### Modelo de Datos

**Relaciones**:
- **Tenant → User**: 1:N (un tenant tiene muchos usuarios)
- **User → Evaluation**: 1:N (un usuario crea muchas evaluaciones)
- **Evaluation → Dimension**: 1:N (una evaluación tiene 12 dimensiones)
- **Dimension → Subcriterion**: 1:N (una dimensión tiene múltiples subcriterios)
- **Evaluation → Response**: 1:N (una evaluación tiene muchas respuestas)
- **Evaluation → Evidence**: 1:N (una evaluación tiene muchas evidencias)
- **Evaluation → Roadmap**: 1:1 (una evaluación tiene un roadmap)

### Migraciones

- **Prisma Migrate**: Gestión de versiones de esquema
- **Versionado**: Cada cambio de esquema genera migración
- **Rollback**: Soporte para revertir migraciones
- **db push**: Alternativa para desarrollo (sin migraciones)

### Índices

Índices implementados para optimización:
- `users.tenantId`
- `evaluations.tenantId`
- `evaluations.status`
- `dimensions.evaluationId`
- `subcriteria.dimensionId`
- `responses.evaluationId`
- `responses.subcriterionId`
- `evidence.evaluationId`
- `evidence.type`
- `benchmark_data.sector`
- `benchmark_data.dimensionCode`

---

## Seguridad

### Autenticación

- **JWT (JSON Web Tokens)**:
  - Access Token: 15 minutos (configurable)
  - Refresh Token: 7 días (configurable)
  - Almacenamiento: `localStorage` (frontend)
  - Verificación: Middleware `authenticateToken`

### Autorización

- **Roles**: ADMIN, CONSULTANT, USER
- **Multi-tenant**: Aislamiento por `tenantId` en todas las queries
- **Middleware**: Verificación en cada request
- **Validación**: Cada controller verifica `req.user.tenantId`

### Validación

- **Zod**: Validación de esquemas en runtime
- **Sanitización**: Limpieza de inputs
- **SQL Injection**: Prevenido por Prisma (prepared statements)
- **XSS**: Prevenido por React (escapado automático)

### Seguridad HTTP

- **Helmet**: Headers de seguridad configurados
- **CORS**: Configurado para dominios permitidos
- **Rate Limiting**: Protección contra abuso (pendiente implementar)
- **HTTPS**: Requerido en producción (pendiente configurar)

### Almacenamiento de Archivos

- **MinIO** (opcional): Almacenamiento S3-compatible
- **Fallback**: Sistema de archivos local o base64 en BD
- **Validación**: Tipo MIME, tamaño máximo (10MB)
- **Aislamiento**: Archivos por tenant y evaluación

---

## Despliegue y Portabilidad

### Docker

**docker-compose.yml** incluye:
- PostgreSQL (requerido)
- Redis (opcional, comentado)
- MinIO (opcional, comentado)
- Backend
- Frontend

**Ventajas**:
- ✅ Portabilidad total (Linux, macOS, Windows)
- ✅ Configuración consistente
- ✅ Fácil despliegue
- ✅ Aislamiento de dependencias

### Variables de Entorno

**Backend** (`.env`):
```env
DATABASE_URL=postgresql://dma_user:dma_pass@localhost:5433/dma_test_db
JWT_SECRET=dev-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
PORT=3001
NODE_ENV=development
MINIO_ENABLED=false
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

### Instalación Multiplataforma

**Windows**:
- Docker Desktop (recomendado)
- WSL2 (recomendado para desarrollo nativo)
- O instalación nativa con Node.js

**Linux/macOS**:
- Docker y Docker Compose
- O instalación nativa

### Scripts de Arranque

**Backend**:
- `bash iniciar-backend.sh`: Inicia backend con verificación de BD
- `npm run dev`: Desarrollo con hot-reload (tsx watch)
- `npm run build`: Compilación para producción
- `npm start`: Ejecución en producción

**Frontend**:
- `npm run dev`: Desarrollo con hot-reload (Vite)
- `npm run build`: Compilación para producción
- `npm run preview`: Preview de producción (sin watch mode, evita EMFILE)

---

## Mejores Prácticas Implementadas

### Código

1. **TypeScript**: Tipado estático en todo el código
2. **ESLint + Prettier**: Formato consistente (pendiente configurar)
3. **Modularización**: Código organizado en módulos
4. **DRY**: No repetición de código
5. **SOLID**: Principios aplicados
6. **Error Handling**: Manejo robusto de errores con `AppError` y middleware
7. **Logging**: Logs estructurados con niveles (INFO, WARN, ERROR)

### Testing

1. **Unit Tests**: Jest (backend), Vitest (frontend)
2. **Integration Tests**: Pruebas de endpoints
3. **Component Tests**: React Testing Library
4. **Coverage**: Objetivo >80% (pendiente alcanzar)
5. **Test Isolation**: `afterEach` limpia datos de prueba (solo en BD de pruebas)

### Documentación

1. **Código**: Comentarios JSDoc en funciones críticas
2. **API**: Documentación de endpoints (pendiente Swagger/OpenAPI)
3. **README**: Instrucciones claras
4. **Guías**: Documentación de usuario y técnica

### Performance

1. **Lazy Loading**: Componentes y rutas (pendiente implementar)
2. **Code Splitting**: Bundles optimizados por Vite
3. **Caching**: React Query para cache automático
4. **Indexación**: Índices en BD para queries frecuentes
5. **Connection Pooling**: Prisma maneja pools automáticamente

### Mantenibilidad

1. **Versionado**: Git con semántico versioning
2. **CI/CD**: Pipelines automatizados (pendiente)
3. **Logging**: Logs estructurados
4. **Monitoring**: Health checks (`/health` endpoint)
5. **Graceful Shutdown**: Manejo de señales SIGTERM/SIGINT

---

## Problemas Resueltos y Lecciones Aprendidas

### 1. Error "EMFILE: too many open files"

**Problema**: El sistema de archivos alcanzaba el límite de archivos abiertos en modo watch.

**Solución**:
- Aumentar `ulimit -n` en Linux/macOS
- Usar `npm run preview` para frontend (sin watch mode)
- Alternativa: `npm run build && npm run preview`

**Lección**: En sistemas con muchos archivos, evitar watch mode en producción o aumentar límites del sistema.

### 2. Rutas duplicadas en reportes

**Problema**: Backend tenía ruta `/api/reports/reports/:jobId/status` (duplicado).

**Solución**: Corregir `backend/src/routes/reports.ts` para usar `/:jobId/status` en lugar de `/reports/:jobId/status`.

**Lección**: Verificar que las rutas no tengan prefijos duplicados cuando se montan en Express.

### 3. Jobs de reportes perdidos al reiniciar backend

**Problema**: Los jobs de generación de PDF están en memoria (`Map`), se pierden al reiniciar.

**Solución**: Implementar circuit breaker en frontend para detener polling después de 2 errores 404 consecutivos.

**Lección**: Para producción, usar Redis o sistema de colas (Bull, RabbitMQ) para persistir jobs.

### 4. Navegación en React Router

**Problema**: Navegación desde menú lateral no funcionaba correctamente.

**Solución**: Reordenar rutas en `App.tsx` para que rutas simples (`/dashboard`, `/evidence`, `/reports`) estén antes de rutas parametrizadas (`/evaluations/:id`).

**Lección**: React Router matchea rutas en orden, rutas más específicas deben ir después de rutas generales.

### 5. Autenticación y tokens expirados

**Problema**: Tokens expirados causaban errores 401/403 sin redirección clara.

**Solución**: Implementar interceptor en Axios que redirige a `/login` automáticamente en 401/403.

**Lección**: Manejar errores de autenticación de forma centralizada en interceptores.

### 6. MinIO como dependencia opcional

**Problema**: MinIO causaba fallos de inicio si no estaba disponible.

**Solución**: Hacer MinIO opcional con fallback a almacenamiento local o base64.

**Lección**: Servicios externos deben ser opcionales con fallbacks para desarrollo.

### 7. Test setup limpiando BD de desarrollo

**Problema**: `afterEach` en `setup.ts` limpiaba toda la BD, incluyendo datos de desarrollo.

**Solución**: Aclarar que `setup.ts` solo afecta BD de pruebas, no de desarrollo.

**Lección**: Separar completamente BD de pruebas y desarrollo, usar variables de entorno diferentes.

---

## Instrucciones de Arranque

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd dma-digital

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 3. Iniciar servicios
docker-compose up -d

# 4. Configurar base de datos
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run create-user admin@elico.com admin123

# 5. Acceder
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Opción 2: Desarrollo Nativo (Linux/macOS)

#### Prerequisitos

- Node.js 18+
- PostgreSQL 15+
- npm o yarn

#### Pasos

1. **Configurar base de datos**:
```bash
# Crear base de datos
createdb dma_test_db -p 5433

# O usando psql
psql -p 5433 -U postgres -c "CREATE DATABASE dma_test_db;"
psql -p 5433 -U postgres -c "CREATE USER dma_user WITH PASSWORD 'dma_pass';"
psql -p 5433 -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE dma_test_db TO dma_user;"
```

2. **Backend**:
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
export DATABASE_URL="postgresql://dma_user:dma_pass@localhost:5433/dma_test_db"
export JWT_SECRET="dev-secret"
export JWT_REFRESH_SECRET="dev-refresh-secret"
export PORT=3001
export MINIO_ENABLED=false

# Inicializar base de datos
npx prisma generate
npx prisma db push

# Crear usuario
npm run create-user admin@elico.com admin123

# Iniciar servidor
bash iniciar-backend.sh
# O directamente: npm run dev
```

3. **Frontend**:
```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
export VITE_API_URL="http://localhost:3001/api"

# Iniciar servidor de desarrollo
npm run dev
# O para evitar EMFILE: npm run build && npm run preview
```

4. **Acceder**:
- Frontend: http://localhost:3000 (o el puerto que indique)
- Backend: http://localhost:3001

### Opción 3: Script de Arranque Automático

```bash
# Arrancar backend y frontend desde una terminal
bash ARRANQUE_UNA_TERMINAL.sh
```

Este script:
1. Inicia backend en background
2. Espera a que backend esté listo
3. Construye frontend
4. Inicia frontend en modo preview

---

## Troubleshooting

### Backend no inicia

1. Verificar que PostgreSQL esté corriendo
2. Verificar conexión a BD: `psql $DATABASE_URL -c "SELECT 1;"`
3. Verificar que el puerto 3001 esté disponible: `lsof -i :3001`
4. Revisar logs: `backend/backend.log` o salida de consola

### Frontend no carga evaluaciones

1. Verificar que backend esté corriendo: `curl http://localhost:3001/health`
2. Verificar token en `localStorage`: Abrir DevTools → Application → Local Storage
3. Verificar `VITE_API_URL` en `.env`
4. Revisar consola del navegador para errores

### Error "EMFILE: too many open files"

1. Aumentar límite: `ulimit -n 4096`
2. Usar modo preview: `npm run build && npm run preview`
3. Cerrar otros procesos que usen muchos archivos

### Reportes no se generan

1. Verificar que backend esté corriendo (jobs están en memoria)
2. Si backend se reinició, generar reporte de nuevo
3. Revisar logs del backend para errores en generación de PDF
4. Verificar que la evaluación tenga datos (dimensiones, respuestas)

---

## Conclusión

La arquitectura implementada sigue mejores prácticas de la industria:

- ✅ **Separación de responsabilidades**
- ✅ **Escalabilidad horizontal y vertical**
- ✅ **Seguridad robusta**
- ✅ **Portabilidad con Docker**
- ✅ **Mantenibilidad y testabilidad**
- ✅ **Performance optimizado**
- ✅ **Resiliencia y manejo de errores**

El sistema está diseñado para crecer y adaptarse a necesidades futuras, con una base sólida y documentada.

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0.0
