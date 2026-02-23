# Guía de Prueba Funcional - Caso de Estudio: Automatización en Islas

**Fecha**: Febrero 2026  
**Tipo de Prueba**: Prueba Funcional End-to-End  
**Objetivo**: Verificar que el sistema genera correctamente todos los resultados desde información pre-cargada en BD

---

## 🎯 Objetivo de la Prueba

Esta prueba simula un **levantamiento de información en terreno** donde:

1. ✅ **La información ya está en la base de datos** (simulando levantamiento completado)
2. ✅ **El sistema procesa y genera todo automáticamente**:
   - Cálculo de madurez (subcriterio → dimensión → global)
   - Validación de coherencia y alertas
   - Generación de roadmap con ROI
   - Generación de reportes PDF
   - Visualización en Dashboard

3. ✅ **No se requiere ingresar datos manualmente** - solo usar las funcionalidades del sistema

---

## 🔐 Credenciales de Acceso

- **Email**: `simulacion@dma.test`
- **Password**: `admin123`

---

## 📋 Caso de Estudio Pre-Cargado

### Información en Base de Datos

- **Empresa**: Industrias Colombianas S.A.
- **Evaluación**: "Evaluación DMA - Automatización en Islas (Caso de Estudio)"
- **ID**: `94cf31a0-4084-46ff-912a-c3e604d3e0cc`
- **Sector**: Manufactura
- **Estado**: IN_PROGRESS

### Perfil de la Empresa (Datos Pre-Cargados)

- ✅ **Automatización avanzada pero como "islas"**: 75% automatizado, 5 islas independientes
- ⚠️ **Infraestructura de red limitada**: 30% conectado, sin WiFi en planta
- ⚠️ **Red IT y OT separadas**: Sin convergencia
- ❌ **Sin IoT**: 0 sensores IoT
- ❌ **Sin visualización de datos**: Reportes manuales en Excel
- ❌ **Sin gobierno de datos**: Datos aislados
- ⚠️ **Decisiones intuitivas**: No data-driven

### Datos Pre-Cargados

- **12 dimensiones** inicializadas
- **62 subcriterios** con respuestas completas
- **62 respuestas** con valores de madurez (0-5) y notas detalladas
- **Madurez calculada**: 2.35 / 5.0 (Estructurado)
- **Roadmap generado**: 3 fases, ROI 32%, Inversión $2.5M

---

## 🧪 Pasos de la Prueba Funcional

### Paso 1: Iniciar Sesión

1. Acceder a la aplicación: `http://localhost:3000` (o el puerto que indique)
2. Ingresar credenciales:
   - Email: `simulacion@dma.test`
   - Password: `admin123`
3. Clic en "Iniciar Sesión"
4. **Verificar**: Debe redirigir a la página principal con la lista de evaluaciones

**Resultado Esperado**: ✅ Login exitoso, se muestra la página principal

---

### Paso 2: Ver Evaluación Pre-Cargada

1. En la página principal, buscar la evaluación:
   - **"Evaluación DMA - Automatización en Islas (Caso de Estudio)"**
2. Hacer clic en la tarjeta de la evaluación
3. **Verificar**: Debe mostrar la página de evaluación con las 12 dimensiones

**Resultado Esperado**: ✅ Evaluación visible, 12 dimensiones listadas

---

### Paso 3: Revisar Dimensiones y Subcriterios

1. Navegar por cada dimensión (D1 a D12) usando las pestañas
2. Para cada dimensión, verificar:
   - ✅ Subcriterios tienen valores de madurez (0-5)
   - ✅ Notas detalladas están presentes
   - ✅ Sliders muestran los valores correctos

**Dimensiones a Verificar** (valores esperados):

| Dimensión | Madurez Esperada | Características |
|-----------|------------------|-----------------|
| D1: Estrategia | 2.42 | Estrategia definida pero no ejecutada completamente |
| D2: Talento | 1.93 | Cultura tradicional, capacitación limitada |
| D3: Arquitectura OT/IT | 1.60 | Separación completa OT-IT, sin convergencia |
| D4: Redes | 1.43 | Infraestructura muy limitada, sin redundancia |
| D5: Ciberseguridad | 1.80 | ⚠️ **ALERTA CRÍTICA** - Por debajo del mínimo |
| D6: Datos e IA | 0.95 | Sin IoT, sin visualización, sin gobierno de datos |
| D7: Procesos | 2.30 | Procesos básicos, OEE 65% |
| D8: Automatización | 2.72 | **Fortaleza**: Automatización en islas |
| D9: Mantenimiento | 2.13 | Mantenimiento mixto, predictivo limitado |
| D10: Energía | 1.25 | Sin gestión de demanda, sin renovables |
| D11: Calidad | 2.52 | ISO 9001 certificado, sistema funcional |
| D12: Normativo | 2.20 | Cumplimiento básico normativa colombiana |

**Resultado Esperado**: ✅ Todas las dimensiones muestran valores y notas correctas

---

### Paso 4: Calcular Madurez (Sistema Genera)

1. Desde la página de evaluación, hacer clic en **"Calcular Madurez"**
2. Esperar a que el sistema procese (puede tardar unos segundos)
3. **Verificar**: 
   - ✅ Mensaje de éxito: "Madurez calculada exitosamente"
   - ✅ La evaluación se actualiza con los valores calculados

**Valores Esperados del Sistema**:
- **Madurez Global**: 2.35 / 5.0
- **Clasificación**: "Estructurado"
- **Madurez por Dimensión**: Ver tabla anterior

**Resultado Esperado**: ✅ Sistema calcula correctamente desde los datos en BD

---

### Paso 5: Ver Dashboard - Resumen

1. Hacer clic en **"Dashboard"** desde el menú lateral o desde la evaluación
2. **Pestaña "Resumen"** (por defecto):
   - ✅ **Madurez Global**: 2.35 / 5.0
   - ✅ **Clasificación**: "Estructurado"
   - ✅ **Progreso**: % completado de la evaluación
   - ✅ **Gráfico Radar**: Muestra madurez por dimensión
   - ✅ **Estado de Coherencia**: 78.2% (Critical)

**Resultado Esperado**: ✅ Dashboard muestra todos los valores calculados correctamente

---

### Paso 6: Ver Dashboard - Dimensiones

1. En el Dashboard, cambiar a la **pestaña "Dimensiones"**
2. **Verificar**:
   - ✅ **Gráfico de Barras**: Comparativo de todas las dimensiones
   - ✅ **Valores individuales**: Cada dimensión muestra su madurez
   - ✅ **Identificación visual**: Dimensiones con mayor/menor madurez destacadas

**Resultado Esperado**: ✅ Gráfico de barras muestra correctamente todas las dimensiones

---

### Paso 7: Ver Coherencia y Alertas

1. En el Dashboard, pestaña "Resumen", buscar la sección de **Coherencia**
2. **Verificar**:
   - ✅ **Score de Coherencia**: 78.2%
   - ✅ **Estado**: "Critical" (o "Incoherente")
   - ✅ **Alerta Crítica**: "Ciberseguridad Industrial por debajo del nivel mínimo recomendado"
   - ✅ **Regla**: RN-006
   - ✅ **Sugerencia**: Priorizar mejoras en ciberseguridad

**Resultado Esperado**: ✅ Sistema detecta y muestra correctamente la alerta de coherencia

---

### Paso 8: Generar y Ver Roadmap

1. En el Dashboard, cambiar a la **pestaña "Roadmap"**
2. Si no hay roadmap, hacer clic en **"Generar Roadmap"**
3. Esperar a que el sistema genere (puede tardar unos segundos)
4. **Verificar**:
   - ✅ **3 Fases generadas**:
     - Fase 1: Quick Wins (0-3 meses)
     - Fase 2: Fundamentos (3-6 meses)
     - Fase 3: Integración (6-12 meses)
   - ✅ **Cada fase tiene mejoras** con:
     - Título y descripción
     - ROI estimado
     - Esfuerzo (meses)
     - Costo estimado
     - Valor anual estimado
   - ✅ **Métricas totales**:
     - Inversión Total: ~$2,500,000
     - ROI Total: ~32%
     - Valor Anual: ~$3,300,000

**Resultado Esperado**: ✅ Sistema genera roadmap automáticamente desde los gaps identificados

---

### Paso 9: Generar Reporte PDF - Ejecutivo

1. Navegar a **"Reportes"** desde el menú lateral
2. Seleccionar la evaluación: **"Evaluación DMA - Automatización en Islas (Caso de Estudio)"**
3. Seleccionar tipo: **"Ejecutivo"**
4. Hacer clic en **"Generar y Descargar Reporte"**
5. Esperar 30-60 segundos (el sistema genera el PDF en segundo plano)
6. **Verificar**:
   - ✅ Indicador de progreso aparece
   - ✅ Mensaje: "Generando reporte..."
   - ✅ Después de completarse, el PDF se descarga automáticamente
   - ✅ Nombre del archivo: `reporte-executive-{evaluation-id}-{timestamp}.pdf`

**Contenido Esperado del PDF**:
- ✅ Portada con información de la evaluación
- ✅ Resumen Ejecutivo con madurez global 2.35
- ✅ Clasificación "Estructurado"
- ✅ Madurez por Dimensión (tabla completa)
- ✅ Top 5 Gaps Críticos
- ✅ Recomendaciones Prioritarias

**Resultado Esperado**: ✅ PDF generado correctamente con toda la información

---

### Paso 10: Generar Reporte PDF - Técnico

1. En la página de Reportes, seleccionar tipo: **"Técnico"**
2. Hacer clic en **"Generar y Descargar Reporte"**
3. Esperar a que se genere y descargue
4. **Verificar**:
   - ✅ PDF descargado
   - ✅ Contenido más detallado que el ejecutivo
   - ✅ Incluye métricas técnicas, análisis profundo

**Resultado Esperado**: ✅ PDF técnico generado con mayor detalle

---

### Paso 11: Generar Reporte PDF - Normativo

1. En la página de Reportes, seleccionar tipo: **"Normativo"**
2. Hacer clic en **"Generar y Descargar Reporte"**
3. Esperar a que se genere y descargue
4. **Verificar**:
   - ✅ PDF descargado
   - ✅ Enfoque en cumplimiento normativo colombiano
   - ✅ Dimensión D12 destacada

**Resultado Esperado**: ✅ PDF normativo generado con enfoque en cumplimiento

---

### Paso 12: Probar Evidencias (Opcional)

1. Navegar a **"Evidencias"** desde el menú lateral
2. Seleccionar la evaluación
3. Hacer clic en **"Subir Evidencia"**
4. Seleccionar un archivo (imagen, PDF, etc.)
5. Completar:
   - Tipo: Foto, Documento, Video, o Audio
   - Descripción: Descripción de la evidencia
   - Subcriterio (opcional): Relacionar con un subcriterio
6. Hacer clic en **"Subir"**
7. **Verificar**:
   - ✅ Evidencia subida exitosamente
   - ✅ Aparece en la lista de evidencias
   - ✅ Se puede ver/descargar

**Resultado Esperado**: ✅ Sistema permite subir y gestionar evidencias

---

### Paso 13: Probar Sincronización Offline (Opcional)

1. **Desconectar internet** (desactivar WiFi o desconectar cable)
2. **Verificar**:
   - ✅ Indicador muestra "🔴 Offline"
3. Intentar guardar una respuesta (modificar un valor)
4. **Verificar**:
   - ✅ Se guarda localmente (mensaje de éxito)
5. **Reconectar internet**
6. **Verificar**:
   - ✅ Indicador muestra "🟢 En línea"
   - ✅ Sincronización automática (los cambios se suben al servidor)

**Resultado Esperado**: ✅ Sistema funciona offline y sincroniza automáticamente

---

## ✅ Checklist de Prueba Funcional

### Funcionalidades Core

- [ ] **Login**: Acceso con credenciales correctas
- [ ] **Visualización**: Evaluación visible con todas las dimensiones
- [ ] **Datos**: Todos los subcriterios tienen valores y notas
- [ ] **Cálculo de Madurez**: Sistema calcula correctamente desde BD
- [ ] **Dashboard Resumen**: Muestra madurez global, clasificación, gráfico radar
- [ ] **Dashboard Dimensiones**: Gráfico de barras correcto
- [ ] **Coherencia**: Alertas detectadas y mostradas correctamente
- [ ] **Roadmap**: Generado automáticamente con 3 fases y métricas
- [ ] **Reporte PDF Ejecutivo**: Generado y descargado correctamente
- [ ] **Reporte PDF Técnico**: Generado y descargado correctamente
- [ ] **Reporte PDF Normativo**: Generado y descargado correctamente

### Funcionalidades Adicionales

- [ ] **Evidencias**: Subida y gestión funcionan
- [ ] **Sincronización Offline**: Funciona correctamente
- [ ] **Navegación**: Todas las secciones accesibles
- [ ] **Gráficos**: Se muestran correctamente
- [ ] **Métricas**: Valores calculados correctamente

---

## 📊 Valores Esperados del Sistema

### Madurez Global
- **Valor**: 2.35 / 5.0
- **Clasificación**: Estructurado
- **Interpretación**: Estrategia en ejecución, procesos parcialmente digitalizados

### Coherencia
- **Score**: 78.2%
- **Estado**: Critical
- **Alerta**: Ciberseguridad Industrial (D5) < 2.0

### Roadmap
- **Fases**: 3 (Quick Wins, Fundamentos, Integración)
- **Inversión Total**: ~$2,500,000
- **ROI Total**: ~32%
- **Valor Anual**: ~$3,300,000

### Dimensiones Críticas
- **D6 (Datos e IA)**: 0.95 - Debilidad crítica
- **D4 (Redes)**: 1.43 - Infraestructura limitada
- **D5 (Ciberseguridad)**: 1.80 - Alerta crítica
- **D8 (Automatización)**: 2.72 - Fortaleza (pero en islas)

---

## 🐛 Troubleshooting

### Si no aparece la evaluación

1. Verificar que el backend esté corriendo: `curl http://localhost:3001/health`
2. Verificar credenciales: `simulacion@dma.test` / `admin123`
3. Verificar en BD: `npx prisma studio` y buscar la evaluación

### Si el cálculo de madurez falla

1. Verificar que haya respuestas en BD para todos los subcriterios
2. Revisar logs del backend
3. Intentar calcular de nuevo

### Si el roadmap no se genera

1. Verificar que la madurez esté calculada primero
2. Revisar logs del backend
3. Intentar generar de nuevo

### Si los reportes no se generan

1. Verificar que el backend esté corriendo (jobs están en memoria)
2. Si el backend se reinició, generar reporte de nuevo
3. Revisar logs del backend para errores en generación de PDF

---

## 📝 Notas de la Prueba

- **Tipo**: Prueba funcional end-to-end
- **Datos**: Pre-cargados en BD (simulando levantamiento en terreno)
- **Procesamiento**: Sistema genera todo automáticamente
- **No requiere**: Ingreso manual de datos

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0.0
