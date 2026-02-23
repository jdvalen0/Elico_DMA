# Guía de Uso e Interpretación - DMA Digital ELICO 4.0

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026

---

## Índice

1. [Parte I: Uso de la Aplicación](#parte-i-uso-de-la-aplicación)
   - [Inicio de Sesión](#1-inicio-de-sesión)
   - [Crear una Evaluación](#2-crear-una-evaluación)
   - [Completar una Evaluación](#3-completar-una-evaluación)
   - [Dashboard y Análisis](#4-dashboard-y-análisis)
   - [Roadmap](#5-roadmap)
   - [Reportes](#6-reportes)
   - [Evidencias](#7-evidencias)
   - [Sincronización Offline](#8-sincronización-offline)

2. [Parte II: Guía Detallada por Dimensión](#parte-ii-guía-detallada-por-dimensión)
   - [D1: Estrategia y Gobierno Digital](#d1-estrategia-y-gobierno-digital)
   - [D2: Talento y Cultura Organizacional](#d2-talento-y-cultura-organizacional)
   - [D3: Arquitectura OT/IT](#d3-arquitectura-otit)
   - [D4: Redes Industriales](#d4-redes-industriales)
   - [D5: Ciberseguridad Industrial](#d5-ciberseguridad-industrial)
   - [D6: Gestión de Datos e IA](#d6-gestión-de-datos-e-ia)
   - [D7: Procesos Productivos](#d7-procesos-productivos)
   - [D8: Automatización y Control](#d8-automatización-y-control)
   - [D9: Mantenimiento y Confiabilidad](#d9-mantenimiento-y-confiabilidad)
   - [D10: Gestión Energética y Sostenibilidad](#d10-gestión-energética-y-sostenibilidad)
   - [D11: Calidad y Cumplimiento](#d11-calidad-y-cumplimiento)
   - [D12: Cumplimiento Normativo Colombiano 2026](#d12-cumplimiento-normativo-colombiano-2026)

3. [Parte III: Interpretación de Resultados](#parte-iii-interpretación-de-resultados)
   - [Escala de Madurez](#1-escala-de-madurez-0-5)
   - [Clasificaciones Globales](#2-clasificaciones-globales)
   - [Coherencia](#3-coherencia)
   - [Roadmap](#4-roadmap)

---

## Parte I: Uso de la Aplicación

### 0. Arrancar y Detener el Sistema

Antes de usar la aplicación, es necesario arrancar el backend y el frontend.

#### Arrancar el Sistema

**Un solo comando** (desde la raíz del repo `Elico_DMA`):
```bash
bash arrancar.sh
```
O desde dentro del proyecto:
```bash
cd dma-digital
bash arrancar.sh
```

Este script:
1. ✅ Verifica la conexión a la base de datos
2. ✅ Inicia el backend en background (puerto 3001)
3. ✅ Espera a que el backend esté listo
4. ✅ Construye el frontend
5. ✅ Inicia el frontend en modo preview (puerto 4173 o siguiente disponible)

**Resultado**: 
- Backend corriendo en: `http://localhost:3001`
- Frontend disponible en: `http://localhost:4173` (o el puerto que indique Vite)
- El frontend se queda corriendo en la terminal (puedes ver los logs)

**Espera a ver**:
- `✅ Backend respondiendo en http://localhost:3001`
- `🔗 Frontend: http://localhost:4173`

#### Detener el Sistema

**Un solo comando**:
```bash
cd /home/juan-david-valencia/Escritorio/Elico_DMA/dma-digital
bash detener.sh
```

Este script:
1. ✅ Detiene el backend (usando PID guardado)
2. ✅ Detiene cualquier proceso en el puerto 3001
3. ✅ Detiene el frontend (vite preview)

**Nota**: Si el frontend está corriendo en otra terminal, también puedes presionar `Ctrl+C` en esa terminal.

#### Verificar que Todo Esté Funcionando

1. **Backend**: Abrir en navegador `http://localhost:3001/health`
   - Debe mostrar: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Abrir en navegador `http://localhost:4173` (o el puerto que indique)
   - Debe mostrar la página de login

#### Alternativa: Arranque Manual (Dos Terminales)

Si prefieres tener más control, puedes usar dos terminales:

**Terminal 1 - Backend**:
```bash
cd /home/juan-david-valencia/Escritorio/Elico_DMA/dma-digital/backend
bash iniciar-backend.sh
```

**Terminal 2 - Frontend**:
```bash
cd /home/juan-david-valencia/Escritorio/Elico_DMA/dma-digital/frontend
npm run build && npm run preview
```

Para detener: Presionar `Ctrl+C` en cada terminal.

---

### 1. Inicio de Sesión

1. Accede a la aplicación (por defecto: `http://localhost:4173` o el puerto que indique el sistema)
2. Ingresa tus credenciales:
   - **Email**: Tu email de usuario
   - **Password**: Tu contraseña
3. Haz clic en **"Iniciar Sesión"**

**Nota**: Si el navegador muestra un mensaje de "administrar contraseñas", puedes ignorarlo o deshabilitar el autocompletado del navegador.

**Credenciales para Prueba Funcional**:
- Email: `simulacion@dma.test`
- Password: `admin123`

### 2. Crear una Evaluación

1. Desde la página principal, haz clic en **"+ Nueva Evaluación"**
2. Completa el formulario:
   - **Nombre**: Ej. "Evaluación DMA - Planta Industrial 2026"
   - **Empresa**: Nombre de la empresa a evaluar
   - **Sector**: Selecciona el sector industrial (Manufactura, Alimentos, Química, etc.)
3. Haz clic en **"Crear Evaluación"**
4. El sistema inicializa automáticamente las **12 dimensiones** con sus subcriterios

### 3. Completar una Evaluación

#### Estructura General

La evaluación tiene **12 dimensiones**, cada una con **5-6 subcriterios**:

- **D1**: Estrategia y Gobierno Digital (5 subcriterios)
- **D2**: Talento y Cultura Organizacional (5 subcriterios)
- **D3**: Arquitectura OT/IT (5 subcriterios)
- **D4**: Redes Industriales (5 subcriterios)
- **D5**: Ciberseguridad Industrial (5 subcriterios)
- **D6**: Gestión de Datos e IA (6 subcriterios)
- **D7**: Procesos Productivos (5 subcriterios)
- **D8**: Automatización y Control (5 subcriterios)
- **D9**: Mantenimiento y Confiabilidad (5 subcriterios)
- **D10**: Gestión Energética y Sostenibilidad (5 subcriterios)
- **D11**: Calidad y Cumplimiento (5 subcriterios)
- **D12**: Cumplimiento Normativo Colombiano 2026 (6 subcriterios)

**Total**: 62 subcriterios a evaluar

#### Cómo Evaluar

1. **Navega a la dimensión**: Haz clic en la pestaña correspondiente (D1, D2, D3, etc.)
2. **Para cada subcriterio**:
   - **Selecciona el valor**: Usa el slider (0-5) para indicar el nivel de madurez actual
   - **Agrega notas detalladas**: Explica el estado actual, menciona evidencias, iniciativas, desafíos
   - **Guarda**: Haz clic en **"Guardar"** para cada subcriterio

#### Qué Poner en las Notas

**Estructura recomendada para cada nota**:

1. **Estado Actual**: ¿Qué existe actualmente? Describe la situación real
2. **Evidencias**: Documentos, procesos, sistemas, fotos que lo respaldan
3. **Iniciativas**: Proyectos en curso o planificados relacionados
4. **Métricas**: Datos cuantitativos (porcentajes, números, fechas, KPIs)
5. **Desafíos**: Limitaciones u obstáculos actuales
6. **Mejoras Futuras**: Planes o ideas para mejorar

**Ejemplo de nota completa**:

```
Estado Actual: Estrategia digital definida en el Plan Estratégico 2026-2028, 
aprobada por la junta directiva en diciembre 2025. Incluye 5 objetivos principales 
con presupuesto de $2.5M asignado.

Evidencias: Plan_Estrategico_2026.pdf, Dashboard_Métricas.xlsx, 
Acta_Junta_Directiva_Dic2025.pdf

Iniciativas: Ejecución al 65%: 5 de 8 iniciativas completadas, 2 en curso 
(Proyecto IoT y Digitalización de Procesos), 1 pendiente para Q2 2026.

Métricas: Presupuesto ejecutado: $1.625M (65%), Proyectos completados: 5/8, 
Revisión trimestral con métricas de progreso, ROI acumulado: 12%

Desafíos: Falta de recursos técnicos especializados, resistencia al cambio 
en áreas operativas, integración con sistemas legacy.

Mejoras Futuras: Contratar 2 especialistas en transformación digital, 
implementar programa de cambio organizacional, migrar sistemas legacy a cloud.
```

### 4. Dashboard y Análisis

#### Acceder al Dashboard

Desde la página de evaluación, haz clic en **"Dashboard"** en el menú lateral o navega a `/evaluations/{id}/dashboard`

#### Pestañas del Dashboard

1. **Resumen**:
   - Madurez global y clasificación
   - Progreso de la evaluación (% completado)
   - Estado de coherencia
   - Gráfico radar de madurez por dimensión

2. **Dimensiones**:
   - Gráfico de barras comparativo de todas las dimensiones
   - Madurez individual por dimensión
   - Identificación visual de gaps

3. **Roadmap**:
   - Roadmap de mejora generado automáticamente
   - Fases: Quick Wins, Fundamentos, Integración
   - ROI, esfuerzo y costo estimado

#### Calcular Madurez

1. Completa al menos algunas respuestas en las dimensiones
2. Haz clic en **"Calcular Madurez"** desde la página de evaluación o el dashboard
3. El sistema calcula automáticamente:
   - Madurez por subcriterio (promedio de respuestas)
   - Madurez por dimensión (promedio ponderado de subcriterios)
   - Madurez global (promedio ponderado de 12 dimensiones)
   - Clasificación (Reactivo, Inicial, Estructurado, Integrado, Optimizado, Predictivo/Inteligente)
   - Coherencia entre dimensiones (reglas RN-006 a RN-009)

### 5. Configuración Económica (Moneda y Precios)

La configuración económica permite personalizar la moneda, costos y valores utilizados en el cálculo del roadmap. Esto es esencial para adaptar los valores a tu contexto económico (USD, COP, EUR, etc.).

#### ¿Quién Puede Editar la Configuración Económica?

**Solo usuarios con rol ADMIN o CONSULTANT** pueden editar la configuración económica. Los usuarios regulares (USER) pueden ver los valores pero no editarlos.

#### ¿Dónde Acceder a la Configuración Económica?

Hay **dos formas** de acceder:

**Opción 1: Desde el Dashboard de una Evaluación**
1. Ve a la página principal (Inicio)
2. Haz clic en una evaluación para abrirla
3. Haz clic en el botón **"Dashboard"** (o ve directamente a `/evaluations/{id}/dashboard`)
4. En la parte superior derecha, verás un botón **"Config. Económica"** (ícono de engranaje ⚙️)
5. Haz clic en ese botón

**Opción 2: Desde el Roadmap**
1. Ve al Dashboard de una evaluación
2. Haz clic en la pestaña **"Roadmap"**
3. En la parte superior derecha del roadmap, verás un botón **"Config"** (ícono de engranaje ⚙️)
4. Haz clic en ese botón

#### ¿Qué Parámetros se Pueden Configurar?

La configuración económica incluye:

1. **Moneda**: Selecciona la moneda para los cálculos
   - USD (Dólar Estadounidense)
   - COP (Peso Colombiano)
   - EUR (Euro)
   - MXN (Peso Mexicano)
   - BRL (Real Brasileño)

2. **Tasa de Cambio** (opcional): Si la moneda no es USD, puedes ingresar la tasa de cambio a USD

3. **Costo por Mes de Proyecto**: Costo estimado por mes de trabajo de un proyecto
   - Ejemplo: 200,000,000 COP/mes o 50,000 USD/mes
   - Este valor se usa para calcular el costo total de cada mejora

4. **Valor Anual por Punto de Madurez**: Valor anual estimado por cada punto de madurez ganado
   - Ejemplo: 600,000,000 COP/punto o 150,000 USD/punto
   - Este valor se usa para calcular el beneficio anual de cada mejora

5. **Umbral Mínimo de ROI para Quick Wins**: ROI mínimo para considerar una mejora como Quick Win
   - Valor entre 0 y 1 (ej: 0.2 = 20%)
   - Por defecto: 0.2 (20%)

6. **Máximo de Meses para Quick Win**: Máximo de meses de esfuerzo para considerar una mejora como Quick Win
   - Valor entre 1 y 12 meses
   - Por defecto: 3 meses

#### Tipos de Configuración

**Configuración Global (por Tenant)**
- Se aplica a **todas las evaluaciones** del tenant que no tengan configuración específica
- Accede desde: `/economic-config` (sin ID de evaluación)
- Útil para establecer valores estándar para toda la organización

**Configuración Específica (por Evaluación)**
- Se aplica **solo a una evaluación específica**
- Accede desde: Dashboard de la evaluación → "Config. Económica"
- Útil cuando una evaluación requiere valores diferentes (ej: cliente en otro país)

**Jerarquía de Configuración**:
1. Si una evaluación tiene configuración específica → usa esa
2. Si no, usa la configuración global del tenant
3. Si no hay ninguna → usa valores por defecto (USD, $50K/mes, $150K/punto)

#### Cómo Editar la Configuración Económica

1. **Accede a la página de configuración** (ver sección anterior)

2. **Completa el formulario**:
   - Selecciona la moneda
   - Ingresa el costo por mes (en la moneda seleccionada)
   - Ingresa el valor anual por punto de madurez (en la moneda seleccionada)
   - Ajusta los umbrales de Quick Wins si es necesario
   - (Opcional) Ingresa tasa de cambio si la moneda no es USD

3. **Haz clic en "Guardar Configuración"**

4. **Si estás editando una evaluación específica**, el sistema te preguntará:
   - "¿Deseas regenerar el roadmap con la nueva configuración?"
   - Si seleccionas "Sí", te llevará al Dashboard para regenerar el roadmap

#### ¿Cuándo Configurar la Moneda y Precios?

**Al Crear una Nueva Evaluación**:

1. **Crear la evaluación** (ver sección "Crear una Evaluación")
2. **Completar las respuestas** (ver sección "Completar una Evaluación")
3. **Calcular la madurez** (ver sección "Dashboard y Análisis")
4. **ANTES de generar el roadmap**, configura los valores económicos:
   - Ve al Dashboard de la evaluación
   - Haz clic en "Config. Económica"
   - Configura la moneda y valores según el contexto del cliente
   - Guarda la configuración
5. **Generar el roadmap** (ver sección "Roadmap")
   - El roadmap se generará con los valores configurados
   - Todos los costos y valores aparecerán en la moneda seleccionada

**Ejemplo Práctico**:

```
Cliente en Colombia:
- Moneda: COP
- Costo por mes: 200,000,000 COP
- Valor por punto: 600,000,000 COP
- Resultado: Roadmap con valores en pesos colombianos

Cliente en Estados Unidos:
- Moneda: USD
- Costo por mes: 50,000 USD
- Valor por punto: 150,000 USD
- Resultado: Roadmap con valores en dólares
```

#### Valores por Defecto

Si no configuras valores personalizados, el sistema usa:
- **Moneda**: USD
- **Costo por mes**: $50,000 USD
- **Valor por punto**: $150,000 USD
- **Umbral Quick Win**: 20% ROI
- **Máximo meses Quick Win**: 3 meses

#### Cómo se Calculan los Precios y Valores

El sistema usa la configuración económica para calcular automáticamente:

**1. Costo de cada Mejora**:
```
Costo = Esfuerzo (meses) × Costo por Mes
```
Ejemplo:
- Esfuerzo: 4 meses
- Costo por mes: 200,000,000 COP
- **Costo total: 800,000,000 COP**

**2. Valor Anual de cada Mejora**:
```
Valor Anual = Gap de Madurez × Valor por Punto
```
Ejemplo:
- Gap de madurez: 1.5 puntos
- Valor por punto: 600,000,000 COP
- **Valor anual: 900,000,000 COP**

**3. ROI de cada Mejora**:
```
ROI = (Valor Anual - Costo) / Costo
```
Ejemplo:
- Valor anual: 900,000,000 COP
- Costo: 800,000,000 COP
- **ROI: (900M - 800M) / 800M = 0.125 = 12.5%**

**4. Clasificación de Quick Wins**:
- Se consideran Quick Wins las mejoras que cumplen:
  - Esfuerzo ≤ Máximo de Meses para Quick Win (por defecto: 3 meses)
  - ROI > Umbral Mínimo de ROI (por defecto: 20%)
- Si no hay mejoras que cumplan ambos criterios, el sistema muestra las mejores por ratio ROI/Esfuerzo

#### Impacto en el Roadmap

La configuración económica afecta:
- **Costo de cada mejora**: Se calcula como `esfuerzo (meses) × costo por mes`
- **Valor anual de cada mejora**: Se calcula como `gap de madurez × valor por punto`
- **ROI de cada mejora**: Se calcula como `(valor anual - costo) / costo`
- **Clasificación de Quick Wins**: Basada en umbrales configurados
- **Formato de moneda**: Todos los valores se muestran en la moneda seleccionada

#### Recomendaciones

1. **Configura antes de generar el roadmap**: Asegúrate de tener los valores correctos antes de generar el roadmap para evitar regenerarlo
2. **Usa valores realistas**: Consulta con el equipo de finanzas o el cliente para obtener valores precisos
3. **Considera el contexto**: Valores en Colombia (COP) son diferentes a valores en Estados Unidos (USD)
4. **Actualiza cuando cambien**: Si los costos cambian, actualiza la configuración y regenera el roadmap
5. **Documenta los valores**: Guarda una nota de por qué elegiste esos valores para referencia futura

### 6. Roadmap

#### Generar Roadmap

**⚠️ IMPORTANTE**: Antes de generar el roadmap, asegúrate de haber configurado los valores económicos (ver sección "Configuración Económica"). Si no lo haces, el roadmap se generará con valores por defecto en USD.

**Pasos**:

1. **Calcula la madurez primero** (ver sección "Dashboard y Análisis")
2. **Configura los valores económicos** (ver sección "Configuración Económica")
   - Ve al Dashboard → "Config. Económica"
   - Selecciona moneda y valores
   - Guarda la configuración
3. **Genera el roadmap**:
   - Desde el Dashboard, haz clic en la pestaña **"Roadmap"**
   - Haz clic en el botón **"Generar Roadmap"** (parte superior)
   - El sistema analiza gaps y genera mejoras priorizadas automáticamente
   - Los valores aparecerán en la moneda que configuraste

#### Estructura del Roadmap

El roadmap se organiza en **3 fases**:

- **Fase 1: Quick Wins** (0-3 meses): Mejoras rápidas, alto impacto, bajo esfuerzo
- **Fase 2: Fundamentos** (3-6 meses): Bases sólidas, impacto estratégico
- **Fase 3: Integración** (6-12 meses): Transformación completa, largo plazo

Cada mejora incluye:
- **ROI**: Retorno de inversión estimado
- **Esfuerzo**: Meses estimados de trabajo
- **Costo**: Estimación financiera
- **Valor Anual**: Beneficio anual estimado
- **Dependencias**: Mejoras que deben completarse primero

### 7. Reportes

#### Generar Reporte

1. Navega a **"Reportes"** desde el menú lateral
2. Selecciona la evaluación de la lista desplegable
3. Selecciona el tipo de reporte:
   - **Ejecutivo**: Resumen para alta dirección, enfoque estratégico
   - **Técnico**: Detallado para equipos técnicos, incluye métricas y análisis profundo
   - **Normativo**: Enfoque en cumplimiento normativo colombiano
4. Haz clic en **"Generar y Descargar Reporte"**
5. El sistema genera el PDF en segundo plano (puede tardar 30-60 segundos)
6. El reporte se descarga automáticamente cuando esté listo

**Nota**: Si el reporte tarda más de 2 minutos, puedes cancelar y volver a intentar. Si el backend se reinicia, los trabajos de generación se pierden (están en memoria).

#### Contenido del Reporte

- **Portada**: Información de la evaluación
- **Resumen Ejecutivo**: Madurez global, clasificación, conclusiones principales
- **Madurez por Dimensión**: Tabla completa con valores y clasificaciones
- **Top 5 Gaps Críticos**: Dimensiones con mayor gap hacia la excelencia
- **Recomendaciones Prioritarias**: Acciones sugeridas basadas en gaps

### 8. Evidencias

#### Subir Evidencias

1. Navega a **"Evidencias"** desde el menú lateral
2. Selecciona la evaluación de la lista
3. Haz clic en **"Subir Evidencia"**
4. Selecciona el archivo (imágenes, PDFs, documentos)
5. Completa:
   - **Tipo**: Foto, Documento, Video, Audio
   - **Descripción**: Qué evidencia es y cómo se relaciona con la evaluación
   - **Subcriterio** (opcional): Relacionar con un subcriterio específico

#### Tipos de Evidencias Recomendadas

- **Fotos**: Instalaciones, equipos, procesos, dashboards
- **Documentos**: Planes estratégicos, políticas, procedimientos, certificaciones
- **Videos**: Demostraciones de procesos, sistemas en funcionamiento
- **Audios**: Entrevistas, testimonios

### 9. Sincronización Offline

La aplicación funciona **offline**:

- **Indicador**: 🟢 En línea / 🔴 Offline (visible en la parte superior)
- **Almacenamiento**: Respuestas guardadas localmente en IndexedDB
- **Sincronización**: Automática al reconectar a internet
- **Cola de sincronización**: Respuestas y evidencias se sincronizan en orden

**Recomendación**: Trabaja normalmente, el sistema sincroniza automáticamente cuando hay conexión.

---

## Parte II: Guía Detallada por Dimensión

### D1: Estrategia y Gobierno Digital

**Peso**: 15% (más importante)  
**Subcriterios**: 5

#### D1.1: Visión 4.0 (Peso: 25%)

**Qué evaluar**: ¿Existe una visión clara de transformación digital hacia Industria 4.0?

**Preguntas clave**:
- ¿Hay un documento de visión digital?
- ¿Está alineada con la estrategia corporativa?
- ¿Está comunicada a toda la organización?
- ¿Incluye objetivos medibles?

**Ejemplos de notas**:
- **0-1**: "No existe visión digital definida"
- **2-3**: "Visión en desarrollo, documento borrador, no comunicada"
- **4-5**: "Visión 4.0 definida en Plan Estratégico 2026-2028, comunicada a todos los niveles, objetivos SMART definidos"

#### D1.2: Roadmap estratégico (Peso: 20%)

**Qué evaluar**: ¿Existe un roadmap estratégico con hitos y fechas?

**Preguntas clave**:
- ¿Hay un roadmap documentado?
- ¿Incluye hitos y fechas?
- ¿Está actualizado?
- ¿Tiene responsables asignados?

**Ejemplos de notas**:
- **0-1**: "No hay roadmap formal"
- **2-3**: "Roadmap básico en PowerPoint, sin fechas específicas"
- **4-5**: "Roadmap detallado con 24 hitos, fechas Q1-Q4 2026, responsables asignados, revisión mensual"

#### D1.3: Presupuesto digital (Peso: 20%)

**Qué evaluar**: ¿Hay presupuesto asignado para transformación digital?

**Preguntas clave**:
- ¿Cuánto presupuesto está asignado?
- ¿Qué porcentaje del presupuesto total?
- ¿Está ejecutado?
- ¿Hay aprobación formal?

**Ejemplos de notas**:
- **0-1**: "No hay presupuesto específico"
- **2-3**: "Presupuesto de $500K aprobado, ejecución al 30%"
- **4-5**: "Presupuesto de $2.5M (5% del total), ejecución al 65%, aprobado por junta directiva, tracking mensual"

#### D1.4: Liderazgo comprometido (Peso: 20%)

**Qué evaluar**: ¿El liderazgo está comprometido con la transformación digital?

**Preguntas clave**:
- ¿El CEO/C-level está involucrado?
- ¿Hay un sponsor ejecutivo?
- ¿Se comunica regularmente?
- ¿Hay recursos asignados?

**Ejemplos de notas**:
- **0-1**: "Liderazgo no involucrado"
- **2-3**: "CEO menciona digitalización, sin acciones concretas"
- **4-5**: "CEO es sponsor, comité digital mensual, comunicaciones trimestrales, recursos asignados"

#### D1.5: KPIs estratégicos (Peso: 15%)

**Qué evaluar**: ¿Hay KPIs definidos para medir el progreso digital?

**Preguntas clave**:
- ¿Qué KPIs se miden?
- ¿Con qué frecuencia?
- ¿Hay dashboards?
- ¿Se reportan a la dirección?

**Ejemplos de notas**:
- **0-1**: "No hay KPIs definidos"
- **2-3**: "3 KPIs básicos, medición manual mensual"
- **4-5**: "12 KPIs definidos, dashboard en tiempo real, reporte semanal a dirección, metas Q1-Q4 establecidas"

---

### D2: Talento y Cultura Organizacional

**Peso**: 10%  
**Subcriterios**: 5

#### D2.1: Capacitación digital (Peso: 25%)

**Qué evaluar**: ¿Hay programas de capacitación en competencias digitales?

**Preguntas clave**:
- ¿Qué programas existen?
- ¿Qué porcentaje del personal está capacitado?
- ¿Hay certificaciones?
- ¿Se mide el impacto?

**Ejemplos de notas**:
- **0-1**: "No hay programas de capacitación digital"
- **2-3**: "Algunos cursos online, 20% del personal capacitado"
- **4-5**: "Programa estructurado, 80% del personal capacitado, certificaciones, impacto medido, ROI 15%"

#### D2.2: Cultura de innovación (Peso: 20%)

**Qué evaluar**: ¿Existe una cultura que fomente la innovación?

**Preguntas clave**:
- ¿Hay programas de innovación?
- ¿Se premia la innovación?
- ¿Hay espacios para experimentación?
- ¿Se comparten ideas?

**Ejemplos de notas**:
- **0-1**: "Cultura tradicional, resistencia al cambio"
- **2-3**: "Algunas iniciativas de innovación, sin estructura"
- **4-5**: "Programa de innovación activo, hackathons trimestrales, premios, laboratorio de innovación, 50 ideas/mes"

#### D2.3: Retención de talento (Peso: 20%)

**Qué evaluar**: ¿Se retiene el talento digital?

**Preguntas clave**:
- ¿Cuál es la tasa de rotación?
- ¿Hay planes de carrera?
- ¿Se ofrecen oportunidades de crecimiento?
- ¿Hay beneficios competitivos?

**Ejemplos de notas**:
- **0-1**: "Alta rotación, sin planes de retención"
- **2-3**: "Rotación 15%, algunos planes de carrera"
- **4-5**: "Rotación 5%, planes de carrera estructurados, oportunidades de crecimiento, beneficios competitivos"

#### D2.4: Liderazgo técnico (Peso: 20%)

**Qué evaluar**: ¿Hay líderes técnicos que impulsen la transformación?

**Preguntas clave**:
- ¿Hay CTO/CDO?
- ¿Hay líderes técnicos en áreas clave?
- ¿Tienen autoridad?
- ¿Están involucrados en decisiones estratégicas?

**Ejemplos de notas**:
- **0-1**: "No hay liderazgo técnico definido"
- **2-3**: "CTO recién nombrado, autoridad limitada"
- **4-5**: "CTO con autoridad completa, líderes técnicos en 8 áreas, involucrados en decisiones estratégicas"

#### D2.5: Cambio organizacional (Peso: 15%)

**Qué evaluar**: ¿Hay gestión del cambio organizacional?

**Preguntas clave**:
- ¿Hay un plan de cambio?
- ¿Se comunica efectivamente?
- ¿Se gestiona la resistencia?
- ¿Hay métricas de adopción?

**Ejemplos de notas**:
- **0-1**: "No hay gestión de cambio"
- **2-3**: "Algunas comunicaciones, sin plan estructurado"
- **4-5**: "Plan de cambio estructurado, comunicaciones regulares, gestión de resistencia, 70% de adopción medida"

---

### D3: Arquitectura OT/IT

**Peso**: 12%  
**Subcriterios**: 5

#### D3.1: Convergencia OT-IT (Peso: 25%)

**Qué evaluar**: ¿Están convergiendo los sistemas OT (Operacional) e IT (Tecnología de Información)?

**Preguntas clave**:
- ¿Hay integración entre OT e IT?
- ¿Comparten infraestructura?
- ¿Hay gobernanza unificada?
- ¿Se comparten datos?

**Ejemplos de notas**:
- **0-1**: "OT e IT completamente separados"
- **2-3**: "Algunos proyectos de integración, sin estrategia"
- **4-5**: "Arquitectura convergente, infraestructura compartida, gobernanza unificada, datos integrados"

#### D3.2: Arquitectura de sistemas (Peso: 20%)

**Qué evaluar**: ¿Existe una arquitectura de sistemas bien definida?

**Preguntas clave**:
- ¿Hay documentación de arquitectura?
- ¿Está actualizada?
- ¿Sigue estándares?
- ¿Es escalable?

**Ejemplos de notas**:
- **0-1**: "No hay arquitectura documentada"
- **2-3**: "Diagramas básicos, desactualizados"
- **4-5**: "Arquitectura documentada, actualizada trimestralmente, sigue TOGAF, escalable y modular"

#### D3.3: Integración de datos (Peso: 20%)

**Qué evaluar**: ¿Están integrados los datos de diferentes sistemas?

**Preguntas clave**:
- ¿Hay un data lake o data warehouse?
- ¿Se integran datos de OT e IT?
- ¿Hay ETL/ELT?
- ¿Se accede en tiempo real?

**Ejemplos de notas**:
- **0-1**: "Datos aislados, sin integración"
- **2-3**: "Algunas integraciones puntuales, sin estrategia"
- **4-5**: "Data lake implementado, integración OT-IT, ETL automatizado, acceso en tiempo real"

#### D3.4: Cloud/Edge computing (Peso: 15%)

**Qué evaluar**: ¿Se utiliza cloud o edge computing?

**Preguntas clave**:
- ¿Qué porcentaje está en cloud?
- ¿Hay edge computing?
- ¿Qué servicios cloud se usan?
- ¿Hay estrategia híbrida?

**Ejemplos de notas**:
- **0-1**: "Todo on-premise, sin cloud"
- **2-3**: "Algunos servicios en cloud (20%), sin estrategia"
- **4-5**: "60% en cloud (AWS/Azure), edge computing en planta, estrategia híbrida definida"

#### D3.5: Estándares tecnológicos (Peso: 20%)

**Qué evaluar**: ¿Se siguen estándares tecnológicos?

**Preguntas clave**:
- ¿Qué estándares se usan?
- ¿Están documentados?
- ¿Se cumplen?
- ¿Hay revisiones?

**Ejemplos de notas**:
- **0-1**: "Sin estándares definidos"
- **2-3**: "Algunos estándares, cumplimiento parcial"
- **4-5**: "Estándares ISO/IEC definidos, documentados, cumplimiento 95%, revisiones trimestrales"

---

### D4: Redes Industriales

**Peso**: 8%  
**Subcriterios**: 5

#### D4.1: Conectividad de planta (Peso: 25%)

**Qué evaluar**: ¿Qué porcentaje de la planta está conectada?

**Preguntas clave**:
- ¿Qué % de equipos está conectado?
- ¿Hay cobertura WiFi/5G?
- ¿Qué zonas están conectadas?
- ¿Hay planes de expansión?

**Ejemplos de notas**:
- **0-1**: "Menos del 20% conectado"
- **2-3**: "40-60% conectado, cobertura parcial"
- **4-5**: "80%+ conectado, cobertura completa, WiFi 6 y 5G, planes de expansión"

#### D4.2: Protocolos industriales (Peso: 20%)

**Qué evaluar**: ¿Qué protocolos industriales se usan?

**Preguntas clave**:
- ¿Qué protocolos (Modbus, OPC-UA, Profinet, etc.)?
- ¿Están estandarizados?
- ¿Hay gateways?
- ¿Se migran a estándares modernos?

**Ejemplos de notas**:
- **0-1**: "Protocolos legacy, sin estandarización"
- **2-3**: "Algunos protocolos modernos, mezcla con legacy"
- **4-5**: "OPC-UA y MQTT estandarizados, gateways implementados, migración planificada"

#### D4.3: Ancho de banda (Peso: 20%)

**Qué evaluar**: ¿Es suficiente el ancho de banda?

**Preguntas clave**:
- ¿Cuál es el ancho de banda actual?
- ¿Es suficiente?
- ¿Hay cuellos de botella?
- ¿Hay planes de mejora?

**Ejemplos de notas**:
- **0-1**: "Ancho de banda insuficiente, cuellos de botella"
- **2-3**: "Ancho de banda básico, algunos cuellos de botella"
- **4-5**: "1 Gbps+ en planta, sin cuellos de botella, planes de 10 Gbps"

#### D4.4: Redundancia (Peso: 20%)

**Qué evaluar**: ¿Hay redundancia en las redes?

**Preguntas clave**:
- ¿Hay redundancia física?
- ¿Hay redundancia lógica?
- ¿Cuál es el uptime objetivo?
- ¿Se prueba regularmente?

**Ejemplos de notas**:
- **0-1**: "Sin redundancia, punto único de falla"
- **2-3**: "Redundancia parcial, sin pruebas"
- **4-5**: "Redundancia completa (física y lógica), uptime 99.9%, pruebas trimestrales"

#### D4.5: QoS (Peso: 15%)

**Qué evaluar**: ¿Hay Quality of Service (QoS) configurado?

**Preguntas clave**:
- ¿Está configurado QoS?
- ¿Se prioriza tráfico crítico?
- ¿Hay monitoreo?
- ¿Se ajusta dinámicamente?

**Ejemplos de notas**:
- **0-1**: "Sin QoS, tráfico no priorizado"
- **2-3**: "QoS básico, priorización manual"
- **4-5**: "QoS avanzado, priorización automática, monitoreo en tiempo real, ajuste dinámico"

---

### D5: Ciberseguridad Industrial

**Peso**: 12%  
**Subcriterios**: 5

#### D5.1: Seguridad OT (IEC 62443) (Peso: 25%)

**Qué evaluar**: ¿Se implementa seguridad OT según IEC 62443?

**Preguntas clave**:
- ¿Hay evaluación según IEC 62443?
- ¿Qué nivel de seguridad (SL)?
- ¿Hay zonas y conductos definidos?
- ¿Se audita regularmente?

**Ejemplos de notas**:
- **0-1**: "Sin seguridad OT, sin estándares"
- **2-3**: "Algunas medidas básicas, sin certificación"
- **4-5**: "IEC 62443 SL-2 implementado, zonas y conductos definidos, auditorías anuales"

#### D5.2: Seguridad IT (Peso: 20%)

**Qué evaluar**: ¿Qué nivel de seguridad IT existe?

**Preguntas clave**:
- ¿Hay firewall, antivirus, IDS/IPS?
- ¿Se actualiza regularmente?
- ¿Hay políticas de seguridad?
- ¿Se cumple ISO 27001?

**Ejemplos de notas**:
- **0-1**: "Seguridad IT básica, sin políticas"
- **2-3**: "Firewall y antivirus, actualizaciones irregulares"
- **4-5**: "Seguridad IT robusta, ISO 27001, políticas documentadas, actualizaciones automáticas"

#### D5.3: Gestión de identidades (Peso: 20%)

**Qué evaluar**: ¿Cómo se gestionan las identidades y accesos?

**Preguntas clave**:
- ¿Hay IAM (Identity and Access Management)?
- ¿Se usa MFA (Multi-Factor Authentication)?
- ¿Hay SSO (Single Sign-On)?
- ¿Se revisan accesos regularmente?

**Ejemplos de notas**:
- **0-1**: "Accesos manuales, sin IAM"
- **2-3**: "IAM básico, sin MFA"
- **4-5**: "IAM completo, MFA obligatorio, SSO, revisión trimestral de accesos"

#### D5.4: Monitoreo de amenazas (Peso: 20%)

**Qué evaluar**: ¿Hay monitoreo de amenazas y detección de intrusiones?

**Preguntas clave**:
- ¿Hay SIEM (Security Information and Event Management)?
- ¿Se monitorea 24/7?
- ¿Hay alertas automáticas?
- ¿Se responde rápidamente?

**Ejemplos de notas**:
- **0-1**: "Sin monitoreo, sin detección"
- **2-3**: "Monitoreo básico, alertas manuales"
- **4-5**: "SIEM implementado, monitoreo 24/7, alertas automáticas, respuesta <15 min"

#### D5.5: Respuesta a incidentes (Peso: 15%)

**Qué evaluar**: ¿Hay un plan de respuesta a incidentes?

**Preguntas clave**:
- ¿Existe un plan documentado?
- ¿Se ha probado?
- ¿Hay equipo de respuesta?
- ¿Cuál es el tiempo de respuesta?

**Ejemplos de notas**:
- **0-1**: "Sin plan, sin equipo"
- **2-3**: "Plan básico, sin pruebas"
- **4-5**: "Plan completo, probado trimestralmente, equipo dedicado, respuesta <1 hora"

---

### D6: Gestión de Datos e IA

**Peso**: 10%  
**Subcriterios**: 6

#### D6.1: Captura de datos (Peso: 20%)

**Qué evaluar**: ¿Cómo se capturan los datos?

**Preguntas clave**:
- ¿Qué % de datos se captura automáticamente?
- ¿Qué fuentes de datos hay?
- ¿Hay sensores IoT?
- ¿Se captura en tiempo real?

**Ejemplos de notas**:
- **0-1**: "Captura manual, <20% automática"
- **2-3**: "50% automática, algunas fuentes IoT"
- **4-5**: "80%+ automática, múltiples fuentes IoT, tiempo real, 10K+ sensores"

#### D6.2: Almacenamiento (Peso: 15%)

**Qué evaluar**: ¿Cómo se almacenan los datos?

**Preguntas clave**:
- ¿Dónde se almacenan (cloud, on-premise, híbrido)?
- ¿Cuál es la capacidad?
- ¿Hay backup y disaster recovery?
- ¿Se retiene históricamente?

**Ejemplos de notas**:
- **0-1**: "Almacenamiento local, sin backup"
- **2-3**: "Almacenamiento híbrido, backup básico"
- **4-5**: "Cloud + on-premise, 100TB+, backup automático, disaster recovery, retención 7 años"

#### D6.3: Procesamiento (Peso: 15%)

**Qué evaluar**: ¿Cómo se procesan los datos?

**Preguntas clave**:
- ¿Hay ETL/ELT?
- ¿Se procesa en batch o streaming?
- ¿Qué herramientas se usan?
- ¿Cuál es la latencia?

**Ejemplos de notas**:
- **0-1**: "Procesamiento manual, sin automatización"
- **2-3**: "ETL básico, procesamiento batch"
- **4-5**: "ETL/ELT automatizado, streaming en tiempo real, Apache Spark/Kafka, latencia <1s"

#### D6.4: Analytics (Peso: 20%)

**Qué evaluar**: ¿Qué nivel de analytics existe?

**Preguntas clave**:
- ¿Hay dashboards?
- ¿Qué tipo de analytics (descriptivo, predictivo, prescriptivo)?
- ¿Quién los usa?
- ¿Se toman decisiones basadas en datos?

**Ejemplos de notas**:
- **0-1**: "Sin analytics, reportes manuales"
- **2-3**: "Dashboards básicos, analytics descriptivo"
- **4-5**: "Dashboards avanzados, analytics predictivo y prescriptivo, uso en toda la organización, decisiones data-driven"

#### D6.5: Machine Learning (Peso: 15%)

**Qué evaluar**: ¿Se usa Machine Learning?

**Preguntas clave**:
- ¿Hay modelos ML en producción?
- ¿Qué casos de uso?
- ¿Cuál es el accuracy?
- ¿Se retrenan regularmente?

**Ejemplos de notas**:
- **0-1**: "Sin ML, solo reglas básicas"
- **2-3**: "Algunos modelos piloto, accuracy 70%"
- **4-5**: "5+ modelos en producción, accuracy 90%+, retrenamiento mensual, ROI 25%"

#### D6.6: IA aplicada (Peso: 15%)

**Qué evaluar**: ¿Se usa Inteligencia Artificial avanzada?

**Preguntas clave**:
- ¿Hay aplicaciones de IA (computer vision, NLP, etc.)?
- ¿Qué casos de uso?
- ¿Están en producción?
- ¿Cuál es el impacto?

**Ejemplos de notas**:
- **0-1**: "Sin IA aplicada"
- **2-3**: "Algunos proyectos piloto de IA"
- **4-5**: "IA aplicada en 3 casos de uso (computer vision para calidad, NLP para mantenimiento predictivo), en producción, impacto medible"

---

### D7: Procesos Productivos

**Peso**: 10%  
**Subcriterios**: 5

#### D7.1: Optimización de procesos (Peso: 25%)

**Qué evaluar**: ¿Se optimizan los procesos productivos?

**Preguntas clave**:
- ¿Hay metodologías de optimización (Lean, Six Sigma)?
- ¿Se mide OEE (Overall Equipment Effectiveness)?
- ¿Hay mejoras continuas?
- ¿Cuál es el impacto?

**Ejemplos de notas**:
- **0-1**: "Sin optimización, procesos tradicionales"
- **2-3**: "Algunas iniciativas Lean, OEE 60%"
- **4-5**: "Lean Six Sigma implementado, OEE 85%+, mejoras continuas, impacto 20% productividad"

#### D7.2: Lean Manufacturing (Peso: 20%)

**Qué evaluar**: ¿Se aplica Lean Manufacturing?

**Preguntas clave**:
- ¿Qué herramientas Lean se usan?
- ¿Hay eliminación de desperdicios?
- ¿Se mide el impacto?
- ¿Está culturalmente integrado?

**Ejemplos de notas**:
- **0-1**: "Sin Lean, desperdicios altos"
- **2-3**: "Algunas herramientas Lean, reducción parcial de desperdicios"
- **4-5**: "Lean completo, desperdicios reducidos 40%, impacto medido, cultura Lean establecida"

#### D7.3: Flexibilidad (Peso: 20%)

**Qué evaluar**: ¿Qué tan flexibles son los procesos?

**Preguntas clave**:
- ¿Cuánto tiempo toma cambiar de producto?
- ¿Hay líneas flexibles?
- ¿Se puede producir en lotes pequeños?
- ¿Hay personalización masiva?

**Ejemplos de notas**:
- **0-1**: "Procesos rígidos, cambio de producto >1 día"
- **2-3**: "Alguna flexibilidad, cambio en horas"
- **4-5**: "Procesos altamente flexibles, cambio <30 min, lotes pequeños, personalización masiva"

#### D7.4: Trazabilidad (Peso: 20%)

**Qué evaluar**: ¿Qué nivel de trazabilidad existe?

**Preguntas clave**:
- ¿Se rastrea el producto desde materia prima hasta cliente?
- ¿Qué tecnologías se usan (RFID, códigos QR, blockchain)?
- ¿Es en tiempo real?
- ¿Se usa para recall?

**Ejemplos de notas**:
- **0-1**: "Trazabilidad manual, limitada"
- **2-3**: "Trazabilidad parcial, algunas tecnologías"
- **4-5**: "Trazabilidad completa, RFID/blockchain, tiempo real, recall en <1 hora"

#### D7.5: Calidad en proceso (Peso: 15%)

**Qué evaluar**: ¿Cómo se gestiona la calidad en el proceso?

**Preguntas clave**:
- ¿Hay inspección en línea?
- ¿Se detectan defectos tempranamente?
- ¿Hay control estadístico de procesos (SPC)?
- ¿Cuál es la tasa de defectos?

**Ejemplos de notas**:
- **0-1**: "Inspección final, alta tasa de defectos"
- **2-3**: "Alguna inspección en línea, SPC básico"
- **4-5**: "Inspección en línea completa, detección temprana, SPC avanzado, defectos <0.1%"

---

### D8: Automatización y Control

**Peso**: 10%  
**Subcriterios**: 5

#### D8.1: Nivel de automatización (Peso: 25%)

**Qué evaluar**: ¿Qué nivel de automatización existe?

**Preguntas clave**:
- ¿Qué % de procesos está automatizado?
- ¿Hay robots?
- ¿Hay automatización de decisiones?
- ¿Cuál es el nivel (Nivel 0-5 de automatización)?

**Ejemplos de notas**:
- **0-1**: "<20% automatizado, procesos manuales"
- **2-3**: "40-60% automatizado, algunos robots"
- **4-5**: "80%+ automatizado, robots colaborativos, automatización de decisiones, Nivel 4-5"

#### D8.2: PLC/SCADA (Peso: 20%)

**Qué evaluar**: ¿Qué sistemas PLC/SCADA existen?

**Preguntas clave**:
- ¿Qué % de equipos tiene PLC?
- ¿Hay SCADA centralizado?
- ¿Están integrados?
- ¿Se actualizan regularmente?

**Ejemplos de notas**:
- **0-1**: "PLC básicos, sin SCADA centralizado"
- **2-3**: "60% con PLC, SCADA parcial"
- **4-5**: "90%+ con PLC modernos, SCADA centralizado, integración completa, actualizaciones regulares"

#### D8.3: Control avanzado (Peso: 20%)

**Qué evaluar**: ¿Hay control avanzado (APC, MPC, etc.)?

**Preguntas clave**:
- ¿Hay Advanced Process Control (APC)?
- ¿Hay Model Predictive Control (MPC)?
- ¿Qué procesos lo usan?
- ¿Cuál es el impacto?

**Ejemplos de notas**:
- **0-1**: "Solo control básico PID"
- **2-3**: "Algunos APC, sin MPC"
- **4-5**: "APC y MPC en procesos críticos, impacto 15% eficiencia, ROI 30%"

#### D8.4: HMI (Peso: 15%)

**Qué evaluar**: ¿Qué interfaces humano-máquina existen?

**Preguntas clave**:
- ¿Qué tipo de HMI (pantallas táctiles, tablets, móviles)?
- ¿Son intuitivas?
- ¿Están actualizadas?
- ¿Se usan para decisiones?

**Ejemplos de notas**:
- **0-1**: "HMI básicos, poco intuitivos"
- **2-3**: "HMI modernos en algunas áreas"
- **4-5**: "HMI avanzados, tablets y móviles, intuitivos, actualizados, usados para decisiones"

#### D8.5: Integración de sistemas (Peso: 20%)

**Qué evaluar**: ¿Están integrados los sistemas de control?

**Preguntas clave**:
- ¿Se integran PLC, SCADA, MES, ERP?
- ¿Hay integración horizontal y vertical?
- ¿Se comparten datos?
- ¿Hay arquitectura unificada?

**Ejemplos de notas**:
- **0-1**: "Sistemas aislados, sin integración"
- **2-3**: "Algunas integraciones puntuales"
- **4-5**: "Integración completa PLC-SCADA-MES-ERP, arquitectura unificada, datos compartidos"

---

### D9: Mantenimiento y Confiabilidad

**Peso**: 8%  
**Subcriterios**: 5

#### D9.1: Estrategia de mantenimiento (Peso: 25%)

**Qué evaluar**: ¿Qué estrategia de mantenimiento existe?

**Preguntas clave**:
- ¿Qué tipos (correctivo, preventivo, predictivo)?
- ¿Qué % es cada tipo?
- ¿Está documentada?
- ¿Se revisa regularmente?

**Ejemplos de notas**:
- **0-1**: "Solo mantenimiento correctivo"
- **2-3**: "60% preventivo, 40% correctivo"
- **4-5**: "Estrategia mixta: 20% correctivo, 50% preventivo, 30% predictivo, documentada, revisión trimestral"

#### D9.2: CMMS (Peso: 20%)

**Qué evaluar**: ¿Hay un sistema CMMS (Computerized Maintenance Management System)?

**Preguntas clave**:
- ¿Qué sistema CMMS se usa?
- ¿Qué % de activos está en el sistema?
- ¿Se usa para planificación?
- ¿Se integra con otros sistemas?

**Ejemplos de notas**:
- **0-1**: "Sin CMMS, planificación manual"
- **2-3**: "CMMS básico, 60% de activos"
- **4-5**: "CMMS avanzado (SAP PM), 95% de activos, planificación automatizada, integración completa"

#### D9.3: Mantenimiento predictivo (Peso: 20%)

**Qué evaluar**: ¿Se implementa mantenimiento predictivo?

**Preguntas clave**:
- ¿Qué % de equipos tiene sensores?
- ¿Hay análisis de vibraciones, termografía, etc.?
- ¿Se predicen fallas?
- ¿Cuál es la precisión?

**Ejemplos de notas**:
- **0-1**: "Sin mantenimiento predictivo"
- **2-3**: "Algunos sensores, análisis básico"
- **4-5**: "40% de equipos con sensores, análisis avanzado, predicción 85% precisión, reducción 30% downtime"

#### D9.4: Gestión de repuestos (Peso: 15%)

**Qué evaluar**: ¿Cómo se gestionan los repuestos?

**Preguntas clave**:
- ¿Hay inventario optimizado?
- ¿Se usa ABC analysis?
- ¿Hay proveedores estratégicos?
- ¿Cuál es el nivel de servicio?

**Ejemplos de notas**:
- **0-1**: "Inventario no optimizado, sobrestock"
- **2-3**: "Alguna optimización, ABC básico"
- **4-5**: "Inventario optimizado, ABC avanzado, proveedores estratégicos, nivel de servicio 98%"

#### D9.5: Confiabilidad (Peso: 20%)

**Qué evaluar**: ¿Qué nivel de confiabilidad tienen los equipos?

**Preguntas clave**:
- ¿Cuál es el MTBF (Mean Time Between Failures)?
- ¿Cuál es el MTTR (Mean Time To Repair)?
- ¿Se mide OEE?
- ¿Hay mejoras continuas?

**Ejemplos de notas**:
- **0-1**: "MTBF bajo, MTTR alto, OEE <60%"
- **2-3**: "MTBF medio, MTTR medio, OEE 70%"
- **4-5**: "MTBF alto, MTTR bajo, OEE 85%+, mejoras continuas, confiabilidad clase mundial"

---

### D10: Gestión Energética y Sostenibilidad

**Peso**: 7%  
**Subcriterios**: 5

#### D10.1: Monitoreo energético (Peso: 25%)

**Qué evaluar**: ¿Cómo se monitorea el consumo energético?

**Preguntas clave**:
- ¿Qué % de consumos se monitorea?
- ¿Hay submedición?
- ¿Es en tiempo real?
- ¿Hay dashboards?

**Ejemplos de notas**:
- **0-1**: "Solo medición principal, sin submedición"
- **2-3**: "60% submedición, monitoreo básico"
- **4-5**: "90%+ submedición, tiempo real, dashboards, alertas automáticas"

#### D10.2: Eficiencia energética (Peso: 20%)

**Qué evaluar**: ¿Qué nivel de eficiencia energética existe?

**Preguntas clave**:
- ¿Hay ISO 50001?
- ¿Se mide intensidad energética?
- ¿Hay mejoras implementadas?
- ¿Cuál es el impacto?

**Ejemplos de notas**:
- **0-1**: "Sin gestión de eficiencia, alto consumo"
- **2-3**: "Algunas mejoras, sin certificación"
- **4-5**: "ISO 50001, intensidad energética medida, mejoras implementadas, reducción 20% consumo"

#### D10.3: Gestión de demanda (Peso: 20%)

**Qué evaluar**: ¿Hay gestión de demanda energética?

**Preguntas clave**:
- ¿Se gestiona la demanda pico?
- ¿Hay demand response?
- ¿Se optimiza el consumo?
- ¿Cuál es el ahorro?

**Ejemplos de notas**:
- **0-1**: "Sin gestión de demanda"
- **2-3**: "Alguna gestión básica"
- **4-5**: "Gestión de demanda activa, demand response, optimización automática, ahorro 15%"

#### D10.4: Renovables (Peso: 15%)

**Qué evaluar**: ¿Se usan energías renovables?

**Preguntas clave**:
- ¿Qué % de energía es renovable?
- ¿Qué fuentes (solar, eólica, biomasa)?
- ¿Hay generación propia?
- ¿Hay planes de expansión?

**Ejemplos de notas**:
- **0-1**: "0% renovable, solo energía convencional"
- **2-3**: "20% renovable, algunos proyectos"
- **4-5**: "50%+ renovable, solar y biomasa, generación propia, planes de expansión"

#### D10.5: Huella de carbono (Peso: 20%)

**Qué evaluar**: ¿Se mide y gestiona la huella de carbono?

**Preguntas clave**:
- ¿Se mide Scope 1, 2, 3?
- ¿Hay objetivos de reducción?
- ¿Se reporta?
- ¿Hay certificaciones?

**Ejemplos de notas**:
- **0-1**: "Sin medición de huella de carbono"
- **2-3**: "Medición básica Scope 1 y 2"
- **4-5**: "Medición completa Scope 1, 2, 3, objetivos de reducción, reporte anual, certificaciones"

---

### D11: Calidad y Cumplimiento

**Peso**: 6%  
**Subcriterios**: 5

#### D11.1: Sistemas de calidad (Peso: 25%)

**Qué evaluar**: ¿Qué sistemas de calidad existen?

**Preguntas clave**:
- ¿Hay ISO 9001?
- ¿Hay otros estándares?
- ¿Están certificados?
- ¿Se auditan regularmente?

**Ejemplos de notas**:
- **0-1**: "Sin sistema de calidad formal"
- **2-3**: "ISO 9001 en proceso, sin certificación"
- **4-5**: "ISO 9001 certificado, otros estándares, auditorías regulares, mejora continua"

#### D11.2: Trazabilidad (Peso: 20%)

**Qué evaluar**: ¿Qué nivel de trazabilidad de calidad existe?

**Preguntas clave**:
- ¿Se rastrea calidad desde materia prima?
- ¿Hay lotes identificados?
- ¿Se puede hacer recall?
- ¿Qué tecnologías se usan?

**Ejemplos de notas**:
- **0-1**: "Trazabilidad limitada, manual"
- **2-3**: "Trazabilidad parcial, algunos lotes"
- **4-5**: "Trazabilidad completa, lotes identificados, recall en <1 hora, tecnologías avanzadas"

#### D11.3: Certificaciones (Peso: 20%)

**Qué evaluar**: ¿Qué certificaciones de calidad tiene la empresa?

**Preguntas clave**:
- ¿Qué certificaciones (ISO, HACCP, BRC, etc.)?
- ¿Están vigentes?
- ¿Se renuevan?
- ¿Hay planes de nuevas certificaciones?

**Ejemplos de notas**:
- **0-1**: "Sin certificaciones"
- **2-3**: "1-2 certificaciones básicas"
- **4-5**: "Múltiples certificaciones (ISO 9001, HACCP, BRC), vigentes, renovación planificada, planes de expansión"

#### D11.4: Control estadístico (Peso: 20%)

**Qué evaluar**: ¿Se usa control estadístico de procesos (SPC)?

**Preguntas clave**:
- ¿Hay SPC implementado?
- ¿Qué procesos lo usan?
- ¿Se monitorea en tiempo real?
- ¿Cuál es el impacto?

**Ejemplos de notas**:
- **0-1**: "Sin SPC, control manual"
- **2-3**: "SPC básico en algunos procesos"
- **4-5**: "SPC avanzado en procesos críticos, tiempo real, reducción 30% variabilidad"

#### D11.5: Mejora continua (Peso: 15%)

**Qué evaluar**: ¿Hay cultura de mejora continua en calidad?

**Preguntas clave**:
- ¿Hay metodologías (PDCA, Kaizen)?
- ¿Se implementan mejoras?
- ¿Se mide el impacto?
- ¿Está culturalmente integrado?

**Ejemplos de notas**:
- **0-1**: "Sin mejora continua estructurada"
- **2-3**: "Algunas iniciativas, sin estructura"
- **4-5**: "PDCA y Kaizen implementados, mejoras continuas, impacto medido, cultura establecida"

---

### D12: Cumplimiento Normativo Colombiano 2026

**Peso**: 12%  
**Subcriterios**: 6

#### D12.1: SG-SST (Peso: 25%)

**Qué evaluar**: ¿Está implementado el Sistema de Gestión de Seguridad y Salud en el Trabajo?

**Preguntas clave**:
- ¿Está certificado SG-SST?
- ¿Hay políticas documentadas?
- ¿Se audita regularmente?
- ¿Cuál es el índice de accidentes?

**Ejemplos de notas**:
- **0-1**: "SG-SST no implementado o básico"
- **2-3**: "SG-SST en proceso, algunas políticas"
- **4-5**: "SG-SST certificado, políticas completas, auditorías regulares, índice de accidentes <1"

#### D12.2: Protección de datos (Peso: 15%)

**Qué evaluar**: ¿Se cumple con la normativa de protección de datos (Habeas Data)?

**Preguntas clave**:
- ¿Hay políticas de protección de datos?
- ¿Se cumple Ley 1581/2012?
- ¿Hay consentimiento informado?
- ¿Se audita regularmente?

**Ejemplos de notas**:
- **0-1**: "Sin políticas de protección de datos"
- **2-3**: "Políticas básicas, cumplimiento parcial"
- **4-5**: "Políticas completas, cumplimiento Ley 1581, consentimiento informado, auditorías regulares"

#### D12.3: Normativa ambiental (Peso: 20%)

**Qué evaluar**: ¿Se cumple con la normativa ambiental colombiana?

**Preguntas clave**:
- ¿Hay permisos ambientales?
- ¿Se cumple Ley 99/1993?
- ¿Hay gestión de residuos?
- ¿Se reporta a autoridades?

**Ejemplos de notas**:
- **0-1**: "Sin cumplimiento ambiental, sin permisos"
- **2-3**: "Algunos permisos, cumplimiento parcial"
- **4-5**: "Permisos completos, cumplimiento Ley 99, gestión de residuos, reporte regular"

#### D12.4: Regulación energética (Peso: 10%)

**Qué evaluar**: ¿Se cumple con la regulación energética (Ley 1715/2014)?

**Preguntas clave**:
- ¿Se cumple Ley 1715 (renovables)?
- ¿Hay incentivos aprovechados?
- ¿Se reporta consumo?
- ¿Hay planes de eficiencia?

**Ejemplos de notas**:
- **0-1**: "Sin cumplimiento, sin aprovechamiento de incentivos"
- **2-3**: "Cumplimiento básico, algunos incentivos"
- **4-5**: "Cumplimiento completo, incentivos aprovechados, reporte regular, planes de eficiencia"

#### D12.5: Ciberseguridad (Peso: 20%)

**Qué evaluar**: ¿Se cumple con la normativa de ciberseguridad (Decreto 1078/2015)?

**Preguntas clave**:
- ¿Se cumple Decreto 1078?
- ¿Hay políticas de ciberseguridad?
- ¿Se reportan incidentes?
- ¿Hay certificaciones?

**Ejemplos de notas**:
- **0-1**: "Sin cumplimiento, sin políticas"
- **2-3**: "Cumplimiento parcial, políticas básicas"
- **4-5**: "Cumplimiento completo, políticas documentadas, reporte de incidentes, certificaciones"

#### D12.6: Continuidad operativa (Peso: 10%)

**Qué evaluar**: ¿Hay planes de continuidad operativa?

**Preguntas clave**:
- ¿Hay planes de continuidad?
- ¿Se han probado?
- ¿Cuál es el RTO (Recovery Time Objective)?
- ¿Hay backup y disaster recovery?

**Ejemplos de notas**:
- **0-1**: "Sin planes de continuidad"
- **2-3**: "Planes básicos, sin pruebas"
- **4-5**: "Planes completos, probados trimestralmente, RTO <4 horas, backup y DR implementados"

---

## Parte III: Interpretación de Resultados

### 1. Escala de Madurez (0-5)

| Valor | Nivel | Descripción | Características |
|-------|-------|-------------|-----------------|
| **0** | No implementado | No existe iniciativa o proceso | Sin plan, sin recursos, sin evidencia |
| **1** | Inicial | Idea o plan, sin implementación | Plan en desarrollo, sin ejecución, sin resultados |
| **2** | Básico | Implementación parcial o piloto | Piloto funcionando, resultados limitados, sin escalamiento |
| **3** | Intermedio | Implementación en curso, resultados parciales | Implementación activa, resultados medibles, escalamiento en proceso |
| **4** | Avanzado | Implementación completa, resultados medibles | Implementación completa, resultados consistentes, mejoras continuas |
| **5** | Optimizado | Excelencia, mejora continua, benchmarking | Excelencia demostrada, benchmarking, innovación continua |

### 2. Clasificaciones Globales

#### Reactivo (0.0 - 1.5)

**Características**:
- Reacción a problemas, no planificación
- Poca o ninguna estrategia digital
- Procesos manuales y desconectados
- Tecnología obsoleta o inexistente
- Sin cultura digital

**Acciones prioritarias**:
1. Definir estrategia digital básica
2. Identificar procesos críticos
3. Iniciar proyectos piloto
4. Capacitar al personal
5. Establecer KPIs básicos

#### Inicial (1.5 - 2.5)

**Características**:
- Estrategia definida pero no ejecutada completamente
- Algunos procesos digitalizados
- Tecnología básica implementada
- Iniciativas aisladas
- Cultura digital incipiente

**Acciones prioritarias**:
1. Ejecutar estrategia digital
2. Integrar sistemas existentes
3. Establecer métricas y KPIs
4. Mejorar competencias digitales
5. Escalar proyectos piloto exitosos

#### Estructurado (2.5 - 3.0)

**Características**:
- Estrategia en ejecución
- Procesos digitalizados parcialmente
- Tecnología moderna en algunas áreas
- Cultura digital en desarrollo
- Integración parcial

**Acciones prioritarias**:
1. Completar digitalización de procesos críticos
2. Integrar sistemas completamente
3. Fortalecer cultura digital
4. Implementar analytics avanzado
5. Iniciar transformación operativa

#### Integrado (3.0 - 4.0)

**Características**:
- Estrategia digital en ejecución activa
- Procesos digitalizados e integrados
- Tecnología moderna implementada
- Cultura digital establecida
- Integración horizontal y vertical

**Acciones prioritarias**:
1. Optimizar procesos existentes
2. Integrar ecosistema completo
3. Avanzar en innovación
4. Medir y mejorar continuamente
5. Explorar nuevas tecnologías

#### Optimizado (4.0 - 4.5)

**Características**:
- Estrategia digital madura y ejecutada
- Procesos optimizados y automatizados
- Tecnología de vanguardia
- Cultura digital establecida
- Innovación continua

**Acciones prioritarias**:
1. Mantener excelencia
2. Innovar continuamente
3. Benchmarking con líderes
4. Explorar nuevas tecnologías
5. Compartir mejores prácticas

#### Predictivo/Inteligente (4.5 - 5.0)

**Características**:
- Estrategia digital de clase mundial
- Procesos completamente optimizados y autónomos
- Tecnología de vanguardia con IA
- Cultura de innovación continua
- Liderazgo en la industria

**Acciones prioritarias**:
1. Mantener liderazgo
2. Innovación disruptiva
3. Benchmarking internacional
4. Explorar tecnologías emergentes
5. Compartir conocimiento

### 3. Coherencia

La coherencia mide si los niveles de madurez entre dimensiones son consistentes y lógicos.

#### Reglas de Coherencia (RN-006 a RN-009)

**RN-006**: Si Ciberseguridad Industrial (D5) < 2.0, alerta de riesgo crítico

**RN-007**: Si Arquitectura OT/IT (D3) > 3.0, entonces Redes Industriales (D4) debe ser > 2.5

**RN-008**: Si Automatización (D8) > 4.0, entonces Procesos Productivos (D7) debe ser > 3.0

**RN-009**: Si Estrategia (D1) > 3.0, entonces al menos 3 dimensiones operativas (D7-D11) deben ser > 2.5

#### Interpretación del Score de Coherencia

| Score | Interpretación | Acciones |
|-------|----------------|----------|
| **> 0.9** | Muy coherente | Mantener alineación |
| **0.7 - 0.9** | Coherente | Revisar dimensiones desalineadas |
| **0.5 - 0.7** | Incoherente | Priorizar dimensiones desalineadas |
| **< 0.5** | Muy incoherente | Revisar evaluación completa |

#### Acciones si Incoherente

1. **Identificar dimensiones desalineadas**: Revisar el dashboard para ver qué dimensiones están fuera de rango
2. **Priorizar dimensiones operativas**: Si estrategia es alta pero operativa baja, enfocarse en ejecución
3. **Asegurar alineación**: Estrategia y ejecución deben estar alineadas
4. **Revisar roadmap**: Asegurar que el roadmap balancee dimensiones

### 4. Roadmap

#### Interpretación de Fases

**Fase 1: Quick Wins (0-3 meses)**
- Mejoras rápidas, alto impacto, bajo esfuerzo
- Enfocarse primero en estas mejoras
- Resultados visibles en corto plazo
- Alto ROI, bajo riesgo

**Fase 2: Fundamentos (3-6 meses)**
- Bases sólidas para transformación
- Impacto estratégico
- Requiere más recursos
- ROI medio-alto

**Fase 3: Integración (6-12 meses)**
- Transformación completa
- Largo plazo
- Requiere recursos significativos
- ROI alto pero a largo plazo

#### Priorización de Mejoras

Prioriza mejoras con:
1. **Alto ROI**: Mayor retorno de inversión
2. **Bajo esfuerzo**: Quick Wins primero
3. **Alto impacto**: En dimensiones críticas
4. **Dependencias resueltas**: Asegurar que las dependencias estén completadas

#### Interpretación de Métricas

- **ROI**: Retorno de inversión estimado (ej: 2.5 = 250% de retorno)
- **Esfuerzo**: Meses estimados de trabajo
- **Costo**: Inversión estimada en dinero
- **Valor Anual**: Beneficio anual estimado
- **Payback**: Meses para recuperar inversión

---

## Consejos y Mejores Prácticas

### Para una Evaluación Exitosa

1. **Preparación**: Reúne documentación, consulta con diferentes áreas (IT, OT, Producción, Calidad, etc.)
2. **Notas Detalladas**: Sé específico, incluye referencias y métricas
3. **Evidencias**: Documenta cada dimensión con archivos relevantes (fotos, documentos, dashboards)
4. **Revisión**: Analiza el dashboard y roadmap regularmente
5. **Iteración**: Actualiza la evaluación periódicamente (trimestral o semestral)

### Preguntas Frecuentes

**¿Qué hacer si una dimensión está muy baja?**
- Revisar el roadmap para esa dimensión
- Identificar Quick Wins específicos
- Asignar recursos y presupuesto
- Priorizar en el plan de acción

**¿Cómo mejorar la coherencia?**
- Identificar dimensiones desalineadas
- Priorizar dimensiones operativas si estrategia es alta
- Asegurar que ejecución siga a estrategia
- Revisar y ajustar respuestas si hay errores

**¿Cuándo actualizar la evaluación?**
- **Anual**: Evaluación completa
- **Semestral**: Revisión de progreso
- **Trimestral**: Actualización de dimensiones críticas
- **Después de proyectos**: Reflejar mejoras implementadas

**¿Qué hacer si no tengo información para un subcriterio?**
- Consulta con el área responsable
- Busca documentación existente
- Si realmente no existe, evalúa con 0 o 1 y explica en notas
- Planifica cómo obtener la información

**¿Cómo interpretar el roadmap?**
- Empieza con Quick Wins para resultados rápidos
- Asegura fundamentos antes de integración
- Considera dependencias entre mejoras
- Revisa ROI y esfuerzo para priorizar

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0.0
