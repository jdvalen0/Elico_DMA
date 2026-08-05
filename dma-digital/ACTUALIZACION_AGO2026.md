# Actualización Agosto 2026 — Autoguardado, Roadmap paramétrico, Evidencias y Reportes

Guía para aplicar esta actualización en el equipo de **producción** (donde ya corre el sistema).
No elimina ni reemplaza ningún componente de la infraestructura existente.

## Qué incluye esta actualización

| Cambio | Detalle |
|--------|---------|
| Autoguardado de respuestas | Ya no hay botón "Guardar" por subcriterio: guarda solo a los ~0.8s de dejar de editar, con indicador por ítem. También guarda al cambiar de dimensión o cerrar la pestaña |
| Dashboard Resumen | El radar muestra ahora código + nombre completo + puntaje de cada dimensión |
| Roadmap paramétrico | Formulario previo (tamaño de empresa, presupuesto opcional). Costos/ROI escalados por tamaño × complejidad de dimensión. Catálogo de acciones y recursos por dimensión. Disclaimer de estimaciones referenciales |
| Fix evidencias | La subida de fotos fallaba con error 500 (BigInt no serializable). Corregido. También el borrado de evidencias (ruta incorrecta). Límite 10MB con mensaje claro |
| Fix Config. Económica | Guardar la configuración fallaba con error 500 cuando "Tasa de cambio" quedaba vacía (el validador rechazaba `null`). Corregido; además los errores de validación ahora responden 400 indicando el campo y el motivo exactos |
| Reportes | El técnico ya no se descarga dos veces. Ejecutivo: +cobertura de la evaluación, fortalezas relativas, acciones concretas por dimensión y plan de inversión del roadmap. Técnico: +peso por dimensión, trazabilidad (quién respondió y cuándo), estadísticas, coherencia D03–D06, top 10 gaps y contribución ponderada al índice. Normativo: matriz dimensión → normas, acción prioritaria específica por dimensión y detalle D12 subcriterio → norma colombiana |
| Fix URL del API | El frontend tenía una URL ngrok hardcodeada; ahora usa `VITE_API_URL` con fallback `http://localhost:3001/api` |
| Calidad de código | Backend y frontend compilan limpio con `tsc` (errores pre-existentes corregidos) |

## Cambios en base de datos

Se agregan dos columnas a la tabla `roadmaps`: `parameters` (JSON) y `excludedByBudget` (entero).
Son **aditivas**: no modifican ni borran datos existentes.

No hay migraciones versionadas en el proyecto; el esquema se sincroniza con `prisma db push`
(paso 4 abajo, **obligatorio** — sin él, generar un roadmap nuevo fallará).

## Pasos en el equipo de producción

### 1. Obtener el código

```bash
cd /ruta/al/repo/Elico_DMA
git pull origin main
```

### 2. Verificar la red externa (solo si nunca se creó en ese equipo)

`docker-compose.yml` declara la red `shared_net` como **externa** (la comparte con otros proyectos,
p. ej. Tiempos). Si el equipo de producción ya la tiene, este paso no hace nada:

```bash
docker network create shared_net 2>/dev/null || echo "shared_net ya existe"
```

Si `docker compose up` muestra `network shared_net declared as external, but could not be found`,
es porque falta este paso.

### 3. Reconstruir y reiniciar

```bash
cd dma-digital
docker compose down
docker compose up -d --build
```

### 4. Sincronizar esquema de base de datos (obligatorio)

```bash
docker compose exec backend npx prisma db push
```

Salida esperada: `Your database is now in sync with your Prisma schema.`

### 5. Verificar

```bash
# Backend saludable
curl http://localhost:3001/health

# Frontend (en producción el puerto puede variar según su compose)
curl -s -o /dev/null -w '%{http_code}' http://localhost:3002
```

Luego en la interfaz:

1. Abrir una evaluación, mover un slider → debe aparecer "Guardando… / Guardado ✓" sin botón.
2. Subir una foto en Evidencias → debe subir sin error.
3. Dashboard → tab Resumen → leyenda con nombres de dimensiones.
4. Roadmap → Regenerar → pedirá tamaño de empresa y presupuesto.
5. Config. Económica → guardar con tasa de cambio vacía → debe guardar sin error.
6. Reportes → generar técnico y normativo → descarga única; revisar contenido nuevo.

## Notas específicas de producción

- **`VITE_API_URL`**: el frontend toma la URL del API de esta variable (fallback `http://localhost:3001/api`).
  - Con el contenedor **dev** (`Dockerfile.dev`, el del compose actual): se lee del entorno del contenedor,
    definido en `docker-compose.yml` como `${VITE_API_URL:-http://localhost:3001/api}`. Ajusten el valor en su `.env`
    (p. ej. `VITE_API_URL=http://IP_DEL_SERVIDOR:3001/api` o su URL ngrok) antes de levantar.
    **Si el navegador no está en la misma máquina que el backend, `localhost` no sirve**: apuntará al PC del usuario.
  - Si usan el **Dockerfile de producción** (nginx + build estático): Vite fija `VITE_API_URL` en
    **tiempo de build**, no de ejecución. Debe estar definida en `frontend/.env` (o como variable de entorno)
    **antes** de `docker build`, o el bundle quedará apuntando al fallback.
  - Si exponen el backend con ngrok u otro túnel, pongan esa URL en `VITE_API_URL`. El header
    `ngrok-skip-browser-warning` sigue incluido en las peticiones.
  - Cambios de `.env` requieren reiniciar el contenedor frontend (`docker compose up -d` lo recrea).
- **`shared_net` externa**: no quitar `external: true` del compose; es la red compartida con otros proyectos
  del equipo. Solo hay que crearla una vez por máquina (paso 2).
- **Puertos**: Postgres `${POSTGRES_PORT:-5433}`, backend `3001`, frontend `3002` (en su compose de
  producción pueden ser distintos — esta actualización no los modifica).
- **`MINIO_ENABLED`**: sigue en `false` por defecto; sin MinIO las evidencias se guardan en base64 en la BD
  (funciona, pero fotos grandes consumen BD; si suben muchas fotos, consideren activar MinIO).
- **Autoguardado**: cada cambio dispara un `PUT` al backend. Con ~62 subcriterios y uso intensivo es
  tráfico mayor que antes (1 request por ítem editado, no por letra ni por movimiento de slider). Sin impacto
  esperado en una LAN normal.

## Rollback

```bash
cd /ruta/al/repo/Elico_DMA
git log --oneline -5            # identificar el commit previo a esta actualización
git checkout <commit_previo> -- dma-digital/
cd dma-digital
docker compose down
docker compose up -d --build
```

Las columnas nuevas de `roadmaps` pueden dejarse; no afectan a la versión anterior.
