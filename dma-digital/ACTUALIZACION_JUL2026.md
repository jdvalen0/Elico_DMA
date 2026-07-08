# Actualizaci?n Julio 2026 — Ayuda en l?nea y orden de dimensiones

Gu?a para aplicar en un equipo de **producci?n** que ya tiene DMA Digital desplegado.

## Cambios incluidos

1. **Ayuda en l?nea por subcriterio**: icono `?` en el formulario de evaluaci?n con texto desplegable (qu? evaluar, preguntas clave, ejemplos por nivel).
2. **Orden correcto en reportes y listados**: dimensiones 1–9 renombradas de `D1`–`D9` a `D01`–`D09` para orden num?rico D01, D02, … D12.

## Archivos principales del cambio

| ?rea | Archivos |
|------|----------|
| Ayuda UI | `frontend/src/components/DimensionForm.tsx`, `frontend/src/constants/subcriteriaHelp.ts` |
| C?digos dimensi?n | `backend/src/services/dimensions.ts`, `backend/src/services/coherenceValidator.ts` |
| Migraci?n BD | `backend/scripts/migrate-dimension-codes.ts` |

## Pasos en el equipo de producci?n

### 1. Obtener el c?digo

```bash
cd /ruta/al/repo/Elico_DMA
git pull origin main
```

Verifica que el historial incluya el commit de ayuda y orden de dimensiones (`D01`–`D09`).

### 2. Reconstruir y reiniciar (Docker)

```bash
cd dma-digital
docker compose up -d --build
```

### 2b. Alternativa: despliegue nativo

```bash
cd dma-digital/backend && npm install && npx prisma generate
cd ../frontend && npm install && npm run build
# Reiniciar backend y frontend seg?n tu proceso (systemd, arrancar.sh, etc.)
```

### 3. Migrar base de datos existente (obligatorio si ya hay evaluaciones)

Si la BD tiene dimensiones con c?digos antiguos (`D1`, `D2`, …):

```bash
cd dma-digital
docker compose exec backend npx tsx scripts/migrate-dimension-codes.ts
```

Sin Docker:

```bash
cd dma-digital/backend
npx tsx scripts/migrate-dimension-codes.ts
```

El script actualiza:

- Tabla `dimensions` (D1?D01, …, D9?D09)
- Tabla `subcriteria` (D1.1?D01.1, etc.)
- Tabla `benchmark_data` (campo `dimensionCode`)

**Evaluaciones nuevas** creadas despu?s del despliegue ya reciben c?digos `D01`–`D09` autom?ticamente.

### 4. Verificaci?n

1. **Login** y abrir una evaluaci?n.
2. En cualquier subcriterio, clic en **?** ? debe mostrarse la ayuda desplegable.
3. Generar un **reporte PDF** ? dimensiones en orden D01, D02, D03, … (no D01, D10, D11).
4. Revisar pesta?as del formulario: deben mostrar D01, D02, etc.

### 5. Rollback (solo si es necesario)

No hay migraci?n autom?tica inversa. Antes de actualizar en producci?n, respalda la BD:

```bash
docker compose exec postgres pg_dump -U dma_user dma_db > backup_pre_jul2026.sql
```

## Notas

- La ayuda en l?nea no requiere cambios en base de datos.
- Las reglas de coherencia (RN-006 a RN-009) usan los nuevos c?digos `D03`, `D05`, `D07`, etc.
- Documentaci?n ampliada: [GUIA_USO_E_INTERPRETACION.md](./GUIA_USO_E_INTERPRETACION.md) (secciones 3 y 7).
