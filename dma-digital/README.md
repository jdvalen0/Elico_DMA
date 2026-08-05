# DMA Digital ELICO 4.0

Sistema de evaluación de madurez digital para empresas industriales.

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026

---

## 🚀 Inicio Rápido

### Con Docker (Recomendado - Multiplataforma)

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd dma-digital

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 3. Crear la red externa (una sola vez por equipo; docker-compose.yml
#    la declara como external para compartirla con otros proyectos)
docker network create shared_net

# 4. Iniciar servicios
docker compose up -d

# 5. Configurar base de datos
#    (no hay migraciones versionadas: el esquema se sincroniza con db push)
docker compose exec backend npx prisma db push
docker compose exec backend npm run create-user admin@elico.com admin123

# 6. Acceder
# Frontend: http://localhost:3002
# Backend:  http://localhost:3001
# Postgres: localhost:5433
```

### Desarrollo Nativo

Ver [ARQUITECTURA_TECNICA.md](./ARQUITECTURA_TECNICA.md#instrucciones-de-arranque) para instrucciones detalladas.

### Windows

Ver [INSTALACION_WINDOWS.md](./INSTALACION_WINDOWS.md) para instrucciones específicas de Windows.

---

## 📚 Documentación

- **[GUIA_USO_E_INTERPRETACION.md](./GUIA_USO_E_INTERPRETACION.md)**: Guía completa de uso de la aplicación, interpretación de resultados, y detalles de cada dimensión y subcriterio
- **[ACTUALIZACION_AGO2026.md](./ACTUALIZACION_AGO2026.md)**: Pasos para actualizar en producción (autoguardado, roadmap paramétrico, evidencias y reportes)
- **[ACTUALIZACION_JUL2026.md](./ACTUALIZACION_JUL2026.md)**: Actualización previa (ayuda en línea + orden D01–D09)
- **[ARQUITECTURA_TECNICA.md](./ARQUITECTURA_TECNICA.md)**: Arquitectura del sistema, stack tecnológico, mejores prácticas, y problemas resueltos
- **[FUNDAMENTACION_CIENTIFICA.md](./FUNDAMENTACION_CIENTIFICA.md)**: Modelo matemático, estado del arte, validación científica, y tendencias internacionales

---

## 🏗️ Stack Tecnológico

### Frontend
- **React 18** + **TypeScript** + **Material-UI**
- **Redux Toolkit** (Estado global)
- **React Query** (Data fetching)
- **Dexie** (IndexedDB para offline)
- **Vite** (Build tool)

### Backend
- **Node.js 18+** + **Express.js** + **TypeScript**
- **Prisma** (ORM)
- **PostgreSQL 15+** (Base de datos)
- **JWT** (Autenticación)
- **Zod** (Validación)

### Infraestructura
- **Docker** + **Docker Compose**
- **PostgreSQL** (Base de datos)
- **Redis** (Cache, opcional)
- **MinIO** (Almacenamiento de archivos, opcional)

---

## 📋 Características

### Evaluación de Madurez Digital

- ✅ **12 dimensiones** de madurez digital industrial
- ✅ **62 subcriterios** evaluables
- ✅ **Escala 0-5** para cada subcriterio
- ✅ **Ayuda en línea** desplegable por subcriterio (qué evaluar, preguntas clave, ejemplos)
- ✅ **Códigos D01–D09** para orden numérico correcto en reportes y listados
- ✅ **Cálculo automático** de madurez (subcriterio → dimensión → global)
- ✅ **Clasificación automática** (Reactivo, Inicial, Estructurado, Integrado, Optimizado, Predictivo/Inteligente)

### Validación y Coherencia

- ✅ **Reglas de coherencia** (RN-006 a RN-009)
- ✅ **Factor de coherencia** basado en desviación estándar
- ✅ **Alertas** de incoherencia (crítica, alta, media, baja)

### Roadmap y Mejoras

- ✅ **Roadmap automático** con 3 fases (Quick Wins, Fundamentos, Integración)
- ✅ **ROI estimado** para cada mejora
- ✅ **Esfuerzo y costo** estimados
- ✅ **Valor anual** estimado

### Reportes

- ✅ **Reportes PDF** (Ejecutivo, Técnico, Normativo)
- ✅ **Dimensiones ordenadas D01→D12** en el contenido del reporte
- ✅ **Generación asíncrona** con polling de estado
- ✅ **Descarga automática** cuando está listo

### Evidencias

- ✅ **Gestión de evidencias** (fotos, documentos, videos, audios)
- ✅ **Almacenamiento flexible** (MinIO opcional, fallback local/base64)
- ✅ **Asociación con subcriterios**

### Funcionalidades Adicionales

- ✅ **Sincronización offline** (IndexedDB)
- ✅ **Multi-tenant** (aislamiento por organización)
- ✅ **Dashboard interactivo** (gráficos radar y barras)
- ✅ **Autenticación JWT** con refresh tokens

---

## 🔧 Requisitos

### Mínimos
- **Docker Desktop** (recomendado) o **Node.js 18+**
- **PostgreSQL 15+** (incluido en Docker)
- **4GB RAM** mínimo
- **10GB espacio** en disco

### Recomendados
- **8GB RAM** para desarrollo cómodo
- **20GB espacio** en disco
- **Conexión a internet** para descargar dependencias

---

## 📖 Uso Básico

1. **Iniciar sesión**: Usa tus credenciales (crear usuario con `npm run create-user`)
2. **Crear evaluación**: Haz clic en "+ Nueva Evaluación"
3. **Completar evaluación**: Evalúa cada subcriterio (0-5) y agrega notas
4. **Calcular madurez**: Haz clic en "Calcular Madurez"
5. **Ver dashboard**: Analiza resultados en gráficos y métricas
6. **Generar roadmap**: Crea un roadmap de mejoras priorizadas
7. **Generar reporte**: Descarga un reporte PDF completo

Para más detalles, consulta [GUIA_USO_E_INTERPRETACION.md](./GUIA_USO_E_INTERPRETACION.md).

### Actualizar en otro equipo (producción)

Si ya tienes una instalación en marcha, sigue la guía de la release vigente:

- **[ACTUALIZACION_AGO2026.md](./ACTUALIZACION_AGO2026.md)** (actual): autoguardado, roadmap paramétrico, fix evidencias y reportes. Incluye `prisma db push` obligatorio.
- [ACTUALIZACION_JUL2026.md](./ACTUALIZACION_JUL2026.md) (previa): ayuda en línea y códigos D01–D09, con `migrate-dimension-codes.ts` para datos existentes.

Notas adicionales para cualquier actualización:

```bash
# La red externa debe existir (una sola vez por equipo)
docker network create shared_net 2>/dev/null || true

# Si el esquema de Prisma cambió (p. ej. nuevos campos en roadmaps), sincronizar:
docker compose exec backend npx prisma db push
```

---

## 🧪 Testing

### Backend

```bash
cd backend
npm test              # Ejecutar todas las pruebas
npm run test:watch    # Modo watch
npm run test:coverage # Con cobertura
```

### Frontend

```bash
cd frontend
npm test              # Ejecutar todas las pruebas
npm run test:watch   # Modo watch
npm run test:coverage # Con cobertura
```

---

## 🐛 Troubleshooting

### Backend no inicia
- Verificar que PostgreSQL esté corriendo
- Verificar conexión a BD: `psql $DATABASE_URL -c "SELECT 1;"`
- Verificar puerto 3001 disponible: `lsof -i :3001`

### Frontend no carga
- Verificar que backend esté corriendo: `curl http://localhost:3001/health`
- Verificar `VITE_API_URL` en `.env`
- Revisar consola del navegador

### Error "EMFILE: too many open files"
- Aumentar límite: `ulimit -n 4096`
- Usar modo preview: `npm run build && npm run preview`

Para más detalles, consulta [ARQUITECTURA_TECNICA.md](./ARQUITECTURA_TECNICA.md#troubleshooting).

---

## 📝 Licencia

Propiedad de ELICO 4.0

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

Para soporte, contacta al equipo de desarrollo de ELICO 4.0.

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026
