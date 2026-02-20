import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { initializeDimensions } from '../src/services/dimensions';
import { calculateGlobalMaturity } from '../src/services/maturityCalculator';
import { validateCoherence } from '../src/services/coherenceValidator';
import { generateRoadmapService } from '../src/services/roadmapGenerator';

const prisma = new PrismaClient();

/**
 * Caso de Estudio: Empresa con Automatización en Islas
 * 
 * Perfil de la empresa:
 * - Automatización avanzada pero como "islas" (procesos aislados)
 * - Sin buena infraestructura de red industrial
 * - Red IT y OT separadas lógicamente (sin convergencia)
 * - Sin IoT
 * - Sin herramientas de visualización de datos
 * - Sin gobierno de datos
 * - Decisiones intuitivas (no data-driven)
 * 
 * Ejecuta: npx tsx scripts/caso-estudio-automatizacion-islas.ts
 */

// Definición de respuestas detalladas por dimensión y subcriterio
const RESPONSES_DATA: Record<string, Record<string, { value: number; notes: string }>> = {
  D1: {
    'D1.1': {
      value: 2.5,
      notes: `Estado Actual: Visión 4.0 mencionada en Plan Estratégico 2025-2027, pero no está completamente definida ni comunicada. La dirección general menciona "transformación digital" pero sin objetivos específicos medibles.

Evidencias: Plan_Estrategico_2025-2027.pdf (página 12, sección "Visión Digital"), Presentación_Dirección_2025.pptx

Iniciativas: Proyecto piloto de digitalización en línea de producción A (Q2 2026), sin roadmap detallado.

Métricas: 40% del personal conoce la visión digital, sin KPIs específicos definidos.

Desafíos: Falta de alineación entre áreas, visión muy general sin detalles técnicos, resistencia al cambio en áreas operativas.

Mejoras Futuras: Definir visión 4.0 detallada con objetivos SMART, comunicar a toda la organización, establecer KPIs de transformación digital.`
    },
    'D1.2': {
      value: 2.0,
      notes: `Estado Actual: Roadmap estratégico básico en PowerPoint, sin fechas específicas ni responsables claramente asignados. Roadmap revisado anualmente pero sin seguimiento trimestral.

Evidencias: Roadmap_Digital_2026.pptx, Acta_Reunion_Direccion_Nov2025.pdf

Iniciativas: 3 proyectos identificados para 2026, sin priorización clara ni dependencias definidas.

Métricas: 0% de hitos cumplidos en tiempo (roadmap muy general), sin métricas de progreso.

Desafíos: Roadmap muy alto nivel, falta de detalle técnico, sin integración con presupuesto operativo.

Mejoras Futuras: Crear roadmap detallado con hitos, fechas, responsables, dependencias, y seguimiento mensual.`
    },
    'D1.3': {
      value: 2.5,
      notes: `Estado Actual: Presupuesto digital de $800K aprobado para 2026 (2% del presupuesto total), ejecución al 35% en Q1. Presupuesto aprobado por dirección pero sin tracking detallado.

Evidencias: Presupuesto_2026.xlsx, Informe_Ejecucion_Q1_2026.pdf

Iniciativas: $280K ejecutados en Q1 (35%), principalmente en infraestructura IT básica.

Métricas: Presupuesto ejecutado: 35%, Proyectos financiados: 2 de 5 planificados.

Desafíos: Presupuesto insuficiente para transformación completa, ejecución lenta, falta de ROI tracking.

Mejoras Futuras: Aumentar presupuesto a 5% del total, implementar tracking mensual, establecer métricas de ROI.`
    },
    'D1.4': {
      value: 3.0,
      notes: `Estado Actual: CEO menciona digitalización en comunicaciones trimestrales, Gerente de IT es sponsor pero con autoridad limitada. Liderazgo presente pero inconsistente en acciones.

Evidencias: Comunicacion_CEO_Q1_2026.pdf, Organigrama_2026.pdf

Iniciativas: Comité digital mensual iniciado en enero 2026, 3 reuniones realizadas.

Métricas: 60% del liderazgo participa en comité digital, 2 decisiones tomadas en Q1.

Desafíos: Sponsor sin autoridad suficiente, decisiones lentas, falta de recursos asignados directamente.

Mejoras Futuras: Fortalecer autoridad del sponsor, asignar recursos directos, acelerar toma de decisiones.`
    },
    'D1.5': {
      value: 2.0,
      notes: `Estado Actual: 3 KPIs básicos definidos (uptime sistemas, proyectos completados, satisfacción usuario), medición manual mensual en Excel. Sin dashboards ni reportes automáticos.

Evidencias: KPIs_Digital_2026.xlsx, Reporte_Mensual_Marzo2026.pdf

Iniciativas: Proyecto para implementar dashboard en Q2 2026, sin herramientas seleccionadas aún.

Métricas: KPIs medidos: 3, Frecuencia: Mensual, Reporte a dirección: Trimestral.

Desafíos: KPIs muy básicos, medición manual propensa a errores, sin alertas automáticas.

Mejoras Futuras: Expandir a 10+ KPIs, implementar dashboard en tiempo real, reportes automáticos semanales.`
    }
  },
  D2: {
    'D2.1': {
      value: 2.0,
      notes: `Estado Actual: Algunos cursos online básicos de Office 365 y herramientas IT, 25% del personal capacitado. Sin programa estructurado ni certificaciones.

Evidencias: Registro_Capacitaciones_2025.xlsx, Certificados_Algunos_Empleados.pdf

Iniciativas: Plan para capacitar 50% del personal en 2026, sin presupuesto específico asignado.

Métricas: Personal capacitado: 25% (60 de 240 empleados), Horas de capacitación: 120 horas/año promedio.

Desafíos: Falta de programa estructurado, capacitación reactiva no proactiva, sin medición de impacto.

Mejoras Futuras: Crear programa estructurado de capacitación digital, asignar presupuesto, medir impacto en productividad.`
    },
    'D2.2': {
      value: 1.5,
      notes: `Estado Actual: Cultura tradicional, resistencia al cambio. Algunas menciones de innovación en reuniones pero sin programas estructurados ni premios.

Evidencias: Encuesta_Cultura_2025.pdf (resistencia al cambio: 65%), Sin programas de innovación documentados.

Iniciativas: Idea de hackathon para Q3 2026, sin plan detallado.

Métricas: Ideas de innovación recibidas: 5 en 2025, Sin métricas de cultura de innovación.

Desafíos: Cultura muy tradicional, resistencia al cambio, falta de incentivos para innovar.

Mejoras Futuras: Implementar programa de innovación, hackathons trimestrales, premios a la innovación, cambiar cultura organizacional.`
    },
    'D2.3': {
      value: 2.5,
      notes: `Estado Actual: Rotación de personal 12% anual, algunos planes de carrera básicos para posiciones técnicas. Sin programas estructurados de retención de talento digital.

Evidencias: Reporte_Rotacion_2025.pdf, Planes_Carrera_Basicos.xlsx

Iniciativas: Programa de retención iniciado en 2025, sin resultados medibles aún.

Métricas: Rotación: 12% anual, Tiempo promedio en empresa: 4.2 años, Planes de carrera: 30% del personal.

Desafíos: Rotación moderada, falta de planes de carrera para talento digital, beneficios no competitivos.

Mejoras Futuras: Reducir rotación a <8%, crear planes de carrera estructurados, mejorar beneficios para talento digital.`
    },
    'D2.4': {
      value: 2.0,
      notes: `Estado Actual: Gerente de IT nombrado en 2024, autoridad limitada a área IT. Sin CTO/CDO, líderes técnicos en áreas operativas pero sin involucramiento en decisiones estratégicas.

Evidencias: Organigrama_2026.pdf, Descripciones_Cargo.xlsx

Iniciativas: Evaluación para crear posición CTO en 2027, sin decisión tomada.

Métricas: Líderes técnicos: 3, Involucrados en decisiones estratégicas: 20%, Autoridad técnica: Limitada.

Desafíos: Falta de liderazgo técnico estratégico, autoridad limitada, decisiones técnicas sin liderazgo técnico.

Mejoras Futuras: Crear posición CTO/CDO, fortalecer autoridad técnica, involucrar líderes técnicos en decisiones estratégicas.`
    },
    'D2.5': {
      value: 1.5,
      notes: `Estado Actual: Sin plan estructurado de gestión de cambio. Algunas comunicaciones sobre nuevos sistemas pero sin gestión de resistencia ni métricas de adopción.

Evidencias: Comunicaciones_Internas_2025.pdf, Sin plan de cambio documentado.

Iniciativas: Algunas sesiones informativas sobre nuevos sistemas, sin programa estructurado.

Métricas: Adopción de nuevos sistemas: 40% estimada, Sin métricas formales de cambio.

Desafíos: Resistencia al cambio alta (65% según encuesta), falta de gestión de cambio, adopción lenta.

Mejoras Futuras: Crear plan de gestión de cambio, comunicaciones regulares, gestión de resistencia, métricas de adopción.`
    }
  },
  D3: {
    'D3.1': {
      value: 1.5,
      notes: `Estado Actual: OT e IT completamente separados. Redes físicas separadas, sin integración. IT maneja sistemas administrativos (ERP, CRM), OT maneja sistemas de producción (SCADA, PLCs) sin conexión.

Evidencias: Diagrama_Red_Actual.pdf, Arquitectura_Sistemas_2026.pptx

Iniciativas: Proyecto piloto para integración OT-IT en Q3 2026, sin detalles técnicos definidos.

Métricas: Sistemas OT conectados a IT: 0%, Datos compartidos: 0%, Integración: Ninguna.

Desafíos: Separación completa OT-IT, sin estrategia de convergencia, resistencia de área OT a integración.

Mejoras Futuras: Definir estrategia de convergencia OT-IT, proyectos piloto de integración, gobernanza unificada.`
    },
    'D3.2': {
      value: 2.0,
      notes: `Estado Actual: Diagramas básicos de arquitectura en PowerPoint, desactualizados (última actualización: 2023). Sin documentación técnica detallada ni estándares arquitectónicos.

Evidencias: Arquitectura_Sistemas_2023.pptx (desactualizado), Sin documentación técnica detallada.

Iniciativas: Proyecto para actualizar documentación en Q2 2026, sin herramientas seleccionadas.

Métricas: Documentación actualizada: 30%, Estándares definidos: Ninguno, Revisión: Anual (insuficiente).

Desafíos: Documentación desactualizada, falta de estándares, sin proceso de actualización.

Mejoras Futuras: Actualizar documentación trimestralmente, definir estándares arquitectónicos (TOGAF), crear proceso de actualización.`
    },
    'D3.3': {
      value: 1.0,
      notes: `Estado Actual: Datos completamente aislados. Sistemas OT (SCADA, PLCs) no comparten datos con sistemas IT (ERP). Sin data lake, data warehouse, ni ETL. Cada sistema mantiene sus propios datos.

Evidencias: Sin integración de datos documentada, Sistemas aislados confirmado por IT.

Iniciativas: Evaluación de herramientas de integración para Q4 2026, sin decisión tomada.

Métricas: Sistemas integrados: 0%, Datos compartidos: 0%, ETL/ELT: Ninguno.

Desafíos: Aislamiento completo de datos, sin estrategia de integración, falta de herramientas.

Mejoras Futuras: Implementar data lake o data warehouse, ETL/ELT para integración, estrategia de datos unificada.`
    },
    'D3.4': {
      value: 1.5,
      notes: `Estado Actual: Todo on-premise. Servidores físicos en planta, sin cloud. Algunos servicios básicos (email, Office 365) en cloud pero sistemas críticos 100% on-premise. Sin edge computing.

Evidencias: Inventario_Servidores_2026.xlsx, Sin servicios cloud críticos.

Iniciativas: Evaluación de migración a cloud para Q4 2026, sin decisión tomada.

Métricas: % en cloud: 10% (solo servicios no críticos), Edge computing: 0%, Servidores on-premise: 15.

Desafíos: Todo on-premise, sin estrategia cloud, falta de edge computing para procesos en tiempo real.

Mejoras Futuras: Definir estrategia cloud híbrida, migrar servicios no críticos, implementar edge computing.`
    },
    'D3.5': {
      value: 2.0,
      notes: `Estado Actual: Algunos estándares básicos (Windows, Office) pero sin estándares tecnológicos documentados para desarrollo, integración, o sistemas industriales. Cumplimiento parcial.

Evidencias: Estándares_Basicos_IT.xlsx, Sin estándares OT documentados.

Iniciativas: Proyecto para definir estándares en Q2 2026, sin avance.

Métricas: Estándares definidos: 20%, Cumplimiento: 60%, Revisiones: Ninguna.

Desafíos: Falta de estándares documentados, cumplimiento parcial, sin revisiones.

Mejoras Futuras: Definir estándares tecnológicos completos, documentar, hacer cumplimiento obligatorio, revisiones trimestrales.`
    }
  },
  D4: {
    'D4.1': {
      value: 1.5,
      notes: `Estado Actual: Menos del 30% de equipos conectados. Red IT básica (Ethernet) para oficinas, red OT separada con protocolos industriales (Modbus, Profibus) pero limitada. Sin cobertura WiFi en planta.

Evidencias: Mapa_Red_Planta_2026.pdf, Inventario_Equipos_Conectados.xlsx

Iniciativas: Proyecto para expandir conectividad en Q3 2026, sin presupuesto aprobado.

Métricas: Equipos conectados: 30% (45 de 150), Cobertura WiFi: 0%, Zonas conectadas: Oficinas y sala de control.

Desafíos: Conectividad muy limitada, sin WiFi en planta, equipos aislados.

Mejoras Futuras: Expandir conectividad a 80%+, implementar WiFi industrial, cobertura completa de planta.`
    },
    'D4.2': {
      value: 2.0,
      notes: `Estado Actual: Protocolos legacy (Modbus RTU, Profibus) en mayoría de equipos. Algunos equipos nuevos con Modbus TCP pero sin estandarización. Sin protocolos modernos (OPC-UA, MQTT).

Evidencias: Lista_Protocolos_Equipos.xlsx, Sin estandarización documentada.

Iniciativas: Plan para migrar a OPC-UA en nuevos proyectos, sin implementación aún.

Métricas: Protocolos legacy: 80%, Protocolos modernos: 20%, Estandarización: 0%.

Desafíos: Protocolos legacy dominantes, falta de estandarización, sin migración planificada.

Mejoras Futuras: Estandarizar en OPC-UA y MQTT, migrar equipos legacy gradualmente, definir estándares de protocolos.`
    },
    'D4.3': {
      value: 1.5,
      notes: `Estado Actual: Ancho de banda limitado. Red IT: 100 Mbps compartida, Red OT: 10 Mbps. Cuellos de botella frecuentes, especialmente durante transferencias de datos SCADA.

Evidencias: Reporte_Ancho_Banda_2026.pdf, Quejas_Usuarios_Slow_Network.xlsx

Iniciativas: Evaluación para upgrade a 1 Gbps en Q4 2026, sin aprobación.

Métricas: Ancho de banda IT: 100 Mbps, OT: 10 Mbps, Cuellos de botella: Frecuentes, Uptime: 95%.

Desafíos: Ancho de banda insuficiente, cuellos de botella, sin planes de mejora inmediatos.

Mejoras Futuras: Upgrade a 1 Gbps+ IT, 100 Mbps+ OT, eliminar cuellos de botella, monitoreo de ancho de banda.`
    },
    'D4.4': {
      value: 1.0,
      notes: `Estado Actual: Sin redundancia. Punto único de falla en switch principal. Si falla, toda la red OT se cae. Sin redundancia física ni lógica. Uptime objetivo: 95% (no cumplido consistentemente).

Evidencias: Diagrama_Red_Sin_Redundancia.pdf, Incidentes_Red_2025.xlsx (5 caídas mayores)

Iniciativas: Proyecto para implementar redundancia en Q2 2027, sin presupuesto.

Métricas: Redundancia física: 0%, Redundancia lógica: 0%, Uptime real: 93%, Objetivo: 95%.

Desafíos: Sin redundancia, punto único de falla, uptime no cumplido.

Mejoras Futuras: Implementar redundancia física y lógica, eliminar puntos únicos de falla, uptime 99.9%.`
    },
    'D4.5': {
      value: 1.0,
      notes: `Estado Actual: Sin QoS configurado. Todo el tráfico tiene la misma prioridad. Tráfico crítico de SCADA compite con tráfico no crítico, causando latencia en procesos críticos.

Evidencias: Sin configuración QoS documentada, Quejas_Latencia_SCADA.xlsx

Iniciativas: Ninguna planificada.

Métricas: QoS configurado: 0%, Priorización: Ninguna, Latencia SCADA: Alta (500ms+).

Desafíos: Sin QoS, tráfico no priorizado, latencia en procesos críticos.

Mejoras Futuras: Configurar QoS, priorizar tráfico crítico (SCADA, control), monitoreo de latencia, ajuste dinámico.`
    }
  },
  D5: {
    'D5.1': {
      value: 1.5,
      notes: `Estado Actual: Seguridad OT básica. Firewall básico entre IT y OT, sin evaluación según IEC 62443. Sin zonas y conductos definidos. Seguridad reactiva, no proactiva.

Evidencias: Configuracion_Firewall_Basico.pdf, Sin evaluación IEC 62443.

Iniciativas: Evaluación de seguridad OT planificada para Q3 2026, sin inicio.

Métricas: Nivel de seguridad (SL): No evaluado, Zonas definidas: 0, Auditorías: Ninguna.

Desafíos: Seguridad OT insuficiente, sin estándares, sin evaluación formal.

Mejoras Futuras: Evaluar según IEC 62443, definir zonas y conductos, implementar SL-2 mínimo, auditorías regulares.`
    },
    'D5.2': {
      value: 2.5,
      notes: `Estado Actual: Seguridad IT básica. Firewall, antivirus, actualizaciones mensuales. Sin ISO 27001, políticas básicas pero no completamente documentadas ni cumplidas.

Evidencias: Políticas_Seguridad_IT_Basicas.pdf, Sin certificación ISO 27001.

Iniciativas: Plan para mejorar seguridad IT en 2026, sin avance significativo.

Métricas: Firewall: Implementado, Antivirus: 95% cobertura, Actualizaciones: Mensuales, ISO 27001: No.

Desafíos: Seguridad IT básica, sin certificación, políticas no completamente cumplidas.

Mejoras Futuras: Mejorar seguridad IT, buscar ISO 27001, políticas completas y cumplimiento, actualizaciones automáticas.`
    },
    'D5.3': {
      value: 2.0,
      notes: `Estado Actual: IAM básico con Active Directory. Sin MFA, SSO parcial (solo algunos sistemas). Accesos revisados anualmente, no trimestralmente.

Evidencias: Configuracion_AD_2026.pdf, Lista_Accesos_2025.xlsx

Iniciativas: Proyecto para implementar MFA en Q2 2026, sin inicio.

Métricas: IAM: Básico (AD), MFA: 0%, SSO: 30% sistemas, Revisión accesos: Anual.

Desafíos: IAM básico, sin MFA, SSO limitado, revisiones infrecuentes.

Mejoras Futuras: Implementar MFA obligatorio, SSO completo, IAM avanzado, revisiones trimestrales.`
    },
    'D5.4': {
      value: 1.5,
      notes: `Estado Actual: Monitoreo básico con logs de firewall y algunos sistemas. Sin SIEM, monitoreo manual, alertas básicas por email. Sin monitoreo 24/7.

Evidencias: Logs_Firewall_2026.pdf, Sin SIEM implementado.

Iniciativas: Evaluación de SIEM para Q4 2026, sin decisión.

Métricas: SIEM: No, Monitoreo 24/7: No, Alertas automáticas: Básicas, Tiempo de detección: >24 horas.

Desafíos: Monitoreo insuficiente, sin SIEM, detección lenta, sin monitoreo continuo.

Mejoras Futuras: Implementar SIEM, monitoreo 24/7, alertas automáticas, detección <15 minutos.`
    },
    'D5.5': {
      value: 1.5,
      notes: `Estado Actual: Plan básico de respuesta a incidentes en documento Word, sin pruebas. Equipo de respuesta informal, sin roles definidos. Tiempo de respuesta: >4 horas.

Evidencias: Plan_Respuesta_Incidentes_Basico.docx, Sin pruebas documentadas.

Iniciativas: Mejorar plan en Q2 2026, sin avance.

Métricas: Plan documentado: Básico, Pruebas: 0, Equipo dedicado: No, Tiempo respuesta: >4 horas.

Desafíos: Plan básico, sin pruebas, equipo informal, respuesta lenta.

Mejoras Futuras: Plan completo, pruebas trimestrales, equipo dedicado, respuesta <1 hora.`
    }
  },
  D6: {
    'D6.1': {
      value: 1.0,
      notes: `Estado Actual: Captura de datos principalmente manual. <20% automática desde SCADA y PLCs. Sin sensores IoT, sin captura en tiempo real. Datos capturados manualmente en Excel.

Evidencias: Procesos_Captura_Datos_Manual.xlsx, Sin sensores IoT documentados.

Iniciativas: Proyecto piloto de sensores IoT para Q3 2026, sin inicio.

Métricas: Captura automática: 15%, Sensores IoT: 0, Fuentes de datos: 3 (SCADA, PLCs, Manual), Tiempo real: No.

Desafíos: Captura principalmente manual, sin IoT, sin tiempo real, propenso a errores.

Mejoras Futuras: Automatizar captura a 80%+, implementar sensores IoT, captura en tiempo real, eliminar procesos manuales.`
    },
    'D6.2': {
      value: 1.5,
      notes: `Estado Actual: Almacenamiento local en servidores on-premise. Sin cloud, capacidad limitada (2TB). Backup básico semanal, sin disaster recovery planificado. Retención: 1 año.

Evidencias: Inventario_Almacenamiento_2026.xlsx, Plan_Backup_Basico.pdf

Iniciativas: Evaluación de cloud storage para Q4 2026, sin decisión.

Métricas: Almacenamiento: 2TB on-premise, Cloud: 0%, Backup: Semanal, Disaster recovery: No, Retención: 1 año.

Desafíos: Capacidad limitada, sin cloud, backup básico, sin DR.

Mejoras Futuras: Expandir a 10TB+, implementar cloud híbrido, backup diario automático, disaster recovery completo.`
    },
    'D6.3': {
      value: 1.0,
      notes: `Estado Actual: Procesamiento manual en Excel y algunos scripts básicos. Sin ETL/ELT, sin procesamiento batch automatizado, sin streaming. Procesamiento reactivo, no proactivo.

Evidencias: Scripts_Procesamiento_Basicos.py, Sin ETL/ELT documentado.

Iniciativas: Evaluación de herramientas ETL para Q4 2026, sin decisión.

Métricas: ETL/ELT: 0%, Procesamiento batch: Manual, Streaming: No, Automatización: 0%.

Desafíos: Procesamiento manual, sin ETL, sin automatización, reactivo.

Mejoras Futuras: Implementar ETL/ELT, procesamiento batch automatizado, streaming en tiempo real, procesamiento proactivo.`
    },
    'D6.4': {
      value: 1.5,
      notes: `Estado Actual: Analytics muy básico. Reportes manuales en Excel, sin dashboards. Analytics descriptivo básico (promedios, totales), sin predictivo ni prescriptivo. Decisiones intuitivas, no data-driven.

Evidencias: Reportes_Excel_2026.xlsx, Sin dashboards documentados.

Iniciativas: Proyecto para implementar dashboard en Q2 2026, sin inicio.

Métricas: Dashboards: 0, Analytics descriptivo: Básico, Predictivo: 0%, Prescriptivo: 0%, Decisiones data-driven: 10%.

Desafíos: Analytics muy básico, sin dashboards, decisiones intuitivas, sin predictivo.

Mejoras Futuras: Implementar dashboards, analytics avanzado, predictivo y prescriptivo, decisiones data-driven.`
    },
    'D6.5': {
      value: 0.5,
      notes: `Estado Actual: Sin Machine Learning. Solo reglas básicas en algunos sistemas. Sin modelos ML en producción, sin casos de uso identificados, sin accuracy medido.

Evidencias: Sin modelos ML documentados, Sin casos de uso ML.

Iniciativas: Evaluación de casos de uso ML para 2027, sin inicio.

Métricas: Modelos ML: 0, Casos de uso: 0, Accuracy: N/A, ROI: N/A.

Desafíos: Sin ML, sin casos de uso, sin conocimiento interno.

Mejoras Futuras: Identificar casos de uso ML, desarrollar modelos piloto, medir accuracy, implementar en producción.`
    },
    'D6.6': {
      value: 0.0,
      notes: `Estado Actual: Sin IA aplicada. No hay aplicaciones de computer vision, NLP, ni otras tecnologías de IA. Sin proyectos de IA, sin casos de uso identificados.

Evidencias: Sin aplicaciones IA documentadas, Sin proyectos IA.

Iniciativas: Ninguna planificada.

Métricas: Aplicaciones IA: 0, Computer vision: 0, NLP: 0, Casos de uso: 0.

Desafíos: Sin IA, sin conocimiento, sin casos de uso.

Mejoras Futuras: Identificar casos de uso IA, proyectos piloto (computer vision para calidad, NLP para mantenimiento), implementar en producción.`
    }
  },
  D7: {
    'D7.1': {
      value: 2.5,
      notes: `Estado Actual: Optimización de procesos básica. Algunas iniciativas Lean, OEE medido manualmente en 65%. Mejoras continuas esporádicas, sin programa estructurado.

Evidencias: Reporte_OEE_2025.pdf, Iniciativas_Lean_Basicas.xlsx

Iniciativas: Programa Lean más estructurado planificado para Q2 2026, sin inicio.

Métricas: OEE: 65% (manual), Iniciativas Lean: 5 en 2025, Impacto: 10% productividad.

Desafíos: OEE bajo, optimización básica, sin programa estructurado.

Mejoras Futuras: Mejorar OEE a 80%+, programa Lean estructurado, mejoras continuas, impacto 20%+ productividad.`
    },
    'D7.2': {
      value: 2.0,
      notes: `Estado Actual: Lean Manufacturing parcial. Algunas herramientas Lean (5S, Kanban) implementadas en áreas piloto. Desperdicios reducidos 15% en áreas piloto, sin escalamiento.

Evidencias: Implementacion_5S_Area_Piloto.pdf, Reduccion_Desperdicios_2025.xlsx

Iniciativas: Escalamiento de Lean a toda la planta en 2026, sin inicio.

Métricas: Herramientas Lean: 2 (5S, Kanban), Áreas implementadas: 20%, Reducción desperdicios: 15%.

Desafíos: Lean parcial, sin escalamiento, impacto limitado.

Mejoras Futuras: Escalar Lean a toda la planta, más herramientas (TPM, SMED), reducción desperdicios 40%+.`
    },
    'D7.3': {
      value: 2.5,
      notes: `Estado Actual: Flexibilidad moderada. Cambio de producto toma 4-6 horas. Líneas semi-flexibles, lotes medianos (100-500 unidades). Sin personalización masiva.

Evidencias: Tiempos_Cambio_Producto_2025.xlsx, Capacidad_Flexibilidad.xlsx

Iniciativas: Proyecto para mejorar flexibilidad en Q3 2026, sin inicio.

Métricas: Tiempo cambio producto: 4-6 horas, Lotes: 100-500 unidades, Personalización: 0%.

Desafíos: Flexibilidad limitada, cambio de producto lento, sin personalización.

Mejoras Futuras: Reducir cambio a <2 horas, lotes pequeños (10-50), personalización masiva.`
    },
    'D7.4': {
      value: 2.0,
      notes: `Estado Actual: Trazabilidad parcial. Trazabilidad manual con códigos de barras en algunas etapas. Sin trazabilidad completa desde materia prima hasta cliente. Sin tecnologías avanzadas (RFID, blockchain).

Evidencias: Sistema_Trazabilidad_Basico.xlsx, Sin RFID ni blockchain.

Iniciativas: Proyecto para mejorar trazabilidad en Q4 2026, sin inicio.

Métricas: Trazabilidad: 60% (parcial), Tecnologías: Códigos de barras básicos, Tiempo recall: >4 horas.

Desafíos: Trazabilidad parcial, manual, sin tecnologías avanzadas.

Mejoras Futuras: Trazabilidad completa, RFID o blockchain, recall <1 hora.`
    },
    'D7.5': {
      value: 2.5,
      notes: `Estado Actual: Calidad en proceso básica. Inspección en línea en algunas etapas críticas, SPC básico. Tasa de defectos: 2.5%, detección tardía en algunos casos.

Evidencias: Reporte_Calidad_2025.pdf, SPC_Basico.xlsx

Iniciativas: Mejorar inspección en línea en Q2 2026, sin inicio.

Métricas: Inspección en línea: 40%, SPC: Básico, Tasa defectos: 2.5%, Detección temprana: 60%.

Desafíos: Inspección limitada, SPC básico, defectos altos.

Mejoras Futuras: Inspección en línea completa, SPC avanzado, defectos <0.5%, detección temprana 95%+.`
    }
  },
  D8: {
    'D8.1': {
      value: 3.5,
      notes: `Estado Actual: Nivel de automatización alto pero como "islas". 75% de procesos automatizados, pero cada isla funciona independientemente. Robots en líneas A y C, automatización de decisiones básica en algunas áreas.

Evidencias: Inventario_Automatizacion_2026.pdf, Robots_Linea_A_C.xlsx

Iniciativas: Proyecto para conectar islas de automatización en Q3 2026, sin inicio.

Métricas: % Automatizado: 75%, Robots: 8, Islas de automatización: 5, Integración: 0%.

Desafíos: Automatización como islas, sin integración, eficiencia limitada.

Mejoras Futuras: Conectar islas de automatización, integración completa, eficiencia 90%+.`
    },
    'D8.2': {
      value: 3.0,
      notes: `Estado Actual: PLC/SCADA implementados pero aislados. 80% de equipos con PLCs modernos, SCADA en cada isla de automatización pero sin centralización. Sistemas no integrados entre islas.

Evidencias: Inventario_PLC_SCADA_2026.xlsx, Arquitectura_SCADA_Islas.pdf

Iniciativas: Proyecto para centralizar SCADA en Q4 2026, sin inicio.

Métricas: Equipos con PLC: 80%, SCADA: 5 sistemas aislados, Centralización: 0%, Integración: 0%.

Desafíos: PLC/SCADA aislados, sin centralización, sin integración.

Mejoras Futuras: Centralizar SCADA, integrar sistemas, visibilidad unificada.`
    },
    'D8.3': {
      value: 2.5,
      notes: `Estado Actual: Control básico (PID) en mayoría, algunos APC en procesos críticos. Sin MPC, control avanzado limitado. Eficiencia mejorada 8% con APC en procesos críticos.

Evidencias: Configuracion_Control_Procesos.pdf, Impacto_APC_2025.xlsx

Iniciativas: Expandir APC a más procesos en Q2 2026, sin inicio.

Métricas: Control PID: 90%, APC: 10%, MPC: 0%, Eficiencia mejorada: 8%.

Desafíos: Control básico dominante, APC limitado, sin MPC.

Mejoras Futuras: Expandir APC, implementar MPC, eficiencia 15%+.`
    },
    'D8.4': {
      value: 3.0,
      notes: `Estado Actual: HMI básicos en cada isla de automatización. Pantallas táctiles en salas de control, algunos tablets para supervisores. HMI no integrados, cada isla tiene su propia interfaz.

Evidencias: Inventario_HMI_2026.xlsx, Interfaces_Islas.pdf

Iniciativas: Proyecto para unificar HMI en Q3 2026, sin inicio.

Métricas: HMI: 12 pantallas, Tablets: 5, Integración: 0%, Intuitividad: Media.

Desafíos: HMI aislados, sin integración, intuitividad limitada.

Mejoras Futuras: Unificar HMI, interfaces intuitivas, integración completa, móviles.`
    },
    'D8.5': {
      value: 1.5,
      notes: `Estado Actual: Sistemas de control completamente aislados. PLCs, SCADA, MES, ERP no integrados. Cada isla de automatización funciona independientemente, sin integración horizontal ni vertical.

Evidencias: Diagrama_Sistemas_Aislados.pdf, Sin integración documentada.

Iniciativas: Proyecto para integrar sistemas en Q4 2026, sin inicio.

Métricas: Sistemas integrados: 0%, Integración horizontal: 0%, Integración vertical: 0%, Visibilidad unificada: 0%.

Desafíos: Sistemas completamente aislados, sin integración, visibilidad limitada.

Mejoras Futuras: Integrar PLC-SCADA-MES-ERP, integración horizontal y vertical, visibilidad unificada.`
    }
  },
  D9: {
    'D9.1': {
      value: 2.5,
      notes: `Estado Actual: Estrategia de mantenimiento mixta. 50% preventivo, 40% correctivo, 10% predictivo básico. Estrategia documentada pero no completamente ejecutada.

Evidencias: Estrategia_Mantenimiento_2026.pdf, Distribucion_Tipos_Mantenimiento.xlsx

Iniciativas: Aumentar mantenimiento predictivo a 30% en 2026, sin inicio.

Métricas: Preventivo: 50%, Correctivo: 40%, Predictivo: 10%, Documentada: Sí.

Desafíos: Correctivo alto, predictivo limitado, ejecución parcial.

Mejoras Futuras: Reducir correctivo a 20%, aumentar predictivo a 30%, ejecución completa.`
    },
    'D9.2': {
      value: 2.0,
      notes: `Estado Actual: CMMS básico (sistema legacy). 70% de activos en sistema, planificación manual, sin integración con otros sistemas. Sistema antiguo, difícil de usar.

Evidencias: CMMS_Legacy_2026.pdf, Cobertura_Activos.xlsx

Iniciativas: Evaluación de CMMS moderno para Q4 2026, sin decisión.

Métricas: CMMS: Básico (legacy), Activos en sistema: 70%, Planificación: Manual, Integración: 0%.

Desafíos: CMMS legacy, cobertura limitada, sin integración.

Mejoras Futuras: CMMS moderno, 95%+ activos, planificación automatizada, integración completa.`
    },
    'D9.3': {
      value: 1.5,
      notes: `Estado Actual: Mantenimiento predictivo básico. Algunos sensores de vibración en equipos críticos, análisis manual mensual. Sin análisis avanzado, sin predicción automática.

Evidencias: Sensores_Vibracion_2026.xlsx, Analisis_Manual_Mensual.pdf

Iniciativas: Expandir sensores y análisis automático en Q3 2026, sin inicio.

Métricas: Equipos con sensores: 15%, Análisis: Manual mensual, Predicción automática: 0%, Precisión: 60%.

Desafíos: Mantenimiento predictivo básico, análisis manual, precisión baja.

Mejoras Futuras: Expandir sensores a 40%+, análisis automático, predicción automática, precisión 85%+.`
    },
    'D9.4': {
      value: 2.0,
      notes: `Estado Actual: Gestión de repuestos básica. Inventario no optimizado, sobrestock en algunos items, faltantes en otros. ABC analysis básico, nivel de servicio 85%.

Evidencias: Inventario_Repuestos_2026.xlsx, ABC_Analysis_Basico.pdf

Iniciativas: Optimizar inventario en Q2 2026, sin inicio.

Métricas: Inventario optimizado: 50%, ABC analysis: Básico, Nivel servicio: 85%, Sobrestock: 20% items.

Desafíos: Inventario no optimizado, sobrestock/faltantes, nivel servicio bajo.

Mejoras Futuras: Optimizar inventario, ABC avanzado, nivel servicio 98%+, eliminar sobrestock.`
    },
    'D9.5': {
      value: 2.5,
      notes: `Estado Actual: Confiabilidad moderada. MTBF: 450 horas, MTTR: 6 horas, OEE: 65%. Mejoras continuas esporádicas, sin programa estructurado.

Evidencias: Metricas_Confiabilidad_2025.pdf, OEE_Report_2025.xlsx

Iniciativas: Programa de mejora de confiabilidad en Q2 2026, sin inicio.

Métricas: MTBF: 450 horas, MTTR: 6 horas, OEE: 65%, Mejoras continuas: Esporádicas.

Desafíos: MTBF bajo, MTTR alto, OEE bajo, sin programa estructurado.

Mejoras Futuras: Mejorar MTBF a 800+ horas, reducir MTTR a 2 horas, OEE 85%+, programa estructurado.`
    }
  },
  D10: {
    'D10.1': {
      value: 1.5,
      notes: `Estado Actual: Monitoreo energético básico. Medición principal en entrada de planta, submedición limitada (30% de consumos). Sin monitoreo en tiempo real, reportes mensuales manuales.

Evidencias: Medicion_Energia_2026.pdf, Submedicion_Limitada.xlsx

Iniciativas: Expandir submedición en Q3 2026, sin inicio.

Métricas: Submedición: 30%, Monitoreo tiempo real: 0%, Reportes: Mensuales manuales, Dashboards: 0.

Desafíos: Monitoreo básico, submedición limitada, sin tiempo real.

Mejoras Futuras: Expandir submedición a 90%+, monitoreo tiempo real, dashboards, alertas automáticas.`
    },
    'D10.2': {
      value: 2.0,
      notes: `Estado Actual: Eficiencia energética básica. Sin ISO 50001, intensidad energética medida manualmente. Algunas mejoras implementadas (iluminación LED, motores eficientes) pero sin programa estructurado.

Evidencias: Intensidad_Energetica_2025.xlsx, Mejoras_Implementadas.pdf

Iniciativas: Evaluación para ISO 50001 en Q4 2026, sin inicio.

Métricas: ISO 50001: No, Intensidad medida: Manual, Mejoras: Algunas, Reducción consumo: 8%.

Desafíos: Sin ISO 50001, medición manual, mejoras limitadas.

Mejoras Futuras: Buscar ISO 50001, medición automática, programa estructurado, reducción 20%+.`
    },
    'D10.3': {
      value: 1.0,
      notes: `Estado Actual: Sin gestión de demanda. No se gestiona demanda pico, sin demand response, sin optimización de consumo. Consumo reactivo, no proactivo.

Evidencias: Sin gestión de demanda documentada, Consumo_Reactivo.xlsx

Iniciativas: Evaluación de gestión de demanda para 2027, sin inicio.

Métricas: Gestión demanda: 0%, Demand response: 0%, Optimización: 0%, Ahorro: 0%.

Desafíos: Sin gestión de demanda, consumo reactivo, sin optimización.

Mejoras Futuras: Implementar gestión de demanda, demand response, optimización automática, ahorro 15%+.`
    },
    'D10.4': {
      value: 0.5,
      notes: `Estado Actual: Sin energías renovables. 0% de energía renovable, solo energía convencional de red. Sin proyectos de renovables, sin generación propia.

Evidencias: Sin proyectos renovables documentados, Consumo_100%_Convencional.xlsx

Iniciativas: Evaluación de solar para 2027, sin inicio.

Métricas: % Renovable: 0%, Generación propia: 0%, Proyectos: 0.

Desafíos: Sin renovables, dependencia total de red, sin proyectos.

Mejoras Futuras: Evaluar solar, implementar 20%+ renovable, generación propia, proyectos renovables.`
    },
    'D10.5': {
      value: 1.0,
      notes: `Estado Actual: Sin medición de huella de carbono. No se mide Scope 1, 2, 3. Sin objetivos de reducción, sin reporte. Sin certificaciones de sostenibilidad.

Evidencias: Sin medición documentada, Sin reportes carbono.

Iniciativas: Evaluación de medición para 2027, sin inicio.

Métricas: Medición Scope 1,2,3: 0%, Objetivos: 0, Reporte: 0, Certificaciones: 0.

Desafíos: Sin medición, sin objetivos, sin reporte.

Mejoras Futuras: Medir Scope 1,2,3, establecer objetivos, reporte anual, certificaciones.`
    }
  },
  D11: {
    'D11.1': {
      value: 3.0,
      notes: `Estado Actual: Sistema de calidad ISO 9001 certificado desde 2020. Certificación vigente, auditorías anuales, mejora continua básica. Sistema funcional pero con oportunidades de mejora.

Evidencias: Certificado_ISO_9001_2020.pdf, Auditorias_Anuales.xlsx

Iniciativas: Renovación certificación en 2026, sin cambios mayores planificados.

Métricas: ISO 9001: Certificado, Vigente: Sí, Auditorías: Anuales, Mejora continua: Básica.

Desafíos: Sistema funcional pero básico, mejora continua limitada.

Mejoras Futuras: Fortalecer sistema, mejora continua avanzada, otras certificaciones.`
    },
    'D11.2': {
      value: 2.5,
      notes: `Estado Actual: Trazabilidad de calidad parcial. Trazabilidad desde materia prima hasta producto final en 70% de productos. Códigos de barras, sin tecnologías avanzadas. Recall en 2-4 horas.

Evidencias: Sistema_Trazabilidad_Calidad.xlsx, Proceso_Recall.pdf

Iniciativas: Mejorar trazabilidad a 100% en Q2 2026, sin inicio.

Métricas: Trazabilidad: 70%, Tecnologías: Códigos de barras, Recall: 2-4 horas, Completa: No.

Desafíos: Trazabilidad parcial, tecnologías básicas, recall lento.

Mejoras Futuras: Trazabilidad 100%, tecnologías avanzadas (RFID), recall <1 hora.`
    },
    'D11.3': {
      value: 2.5,
      notes: `Estado Actual: Certificaciones básicas. ISO 9001, algunas certificaciones de producto según sector. Sin certificaciones avanzadas (ISO 14001, OHSAS 18001, etc.).

Evidencias: Certificaciones_2026.pdf, ISO_9001_Vigente.pdf

Iniciativas: Evaluación de ISO 14001 para 2027, sin inicio.

Métricas: Certificaciones: 2 (ISO 9001 + producto), Vigentes: Sí, Avanzadas: 0.

Desafíos: Certificaciones básicas, sin avanzadas.

Mejoras Futuras: Expandir certificaciones (ISO 14001, OHSAS 18001), mantener vigencia.`
    },
    'D11.4': {
      value: 2.0,
      notes: `Estado Actual: Control estadístico básico. SPC en algunos procesos críticos, análisis manual. Sin SPC avanzado, sin monitoreo en tiempo real. Variabilidad moderada.

Evidencias: SPC_Basico_Procesos_Criticos.xlsx, Analisis_Manual.pdf

Iniciativas: Mejorar SPC en Q2 2026, sin inicio.

Métricas: SPC: Básico, Procesos con SPC: 40%, Tiempo real: 0%, Variabilidad: Moderada.

Desafíos: SPC básico, limitado, sin tiempo real.

Mejoras Futuras: SPC avanzado, 80%+ procesos, tiempo real, variabilidad reducida 30%+.`
    },
    'D11.5': {
      value: 2.5,
      notes: `Estado Actual: Mejora continua básica. PDCA esporádico, algunas iniciativas Kaizen. Sin programa estructurado, mejora continua reactiva no proactiva. Impacto limitado.

Evidencias: Iniciativas_Mejora_2025.xlsx, PDCA_Esporadico.pdf

Iniciativas: Programa de mejora continua más estructurado en Q2 2026, sin inicio.

Métricas: PDCA: Esporádico, Kaizen: Algunas iniciativas, Programa estructurado: No, Impacto: Limitado.

Desafíos: Mejora continua básica, reactiva, impacto limitado.

Mejoras Futuras: Programa estructurado, PDCA regular, Kaizen continuo, impacto medible.`
    }
  },
  D12: {
    'D12.1': {
      value: 3.0,
      notes: `Estado Actual: SG-SST implementado y certificado desde 2019. Certificación vigente, políticas documentadas, auditorías anuales. Índice de accidentes: 1.2 (objetivo: <1.0).

Evidencias: Certificado_SG-SST_2019.pdf, Auditorias_Anuales.xlsx, Indice_Accidentes_2025.pdf

Iniciativas: Mejorar índice de accidentes a <1.0 en 2026, programa de seguridad reforzado.

Métricas: SG-SST: Certificado, Vigente: Sí, Índice accidentes: 1.2, Objetivo: <1.0, Auditorías: Anuales.

Desafíos: Índice de accidentes ligeramente alto, necesita mejora.

Mejoras Futuras: Reducir índice a <1.0, fortalecer programa de seguridad, auditorías más frecuentes.`
    },
    'D12.2': {
      value: 2.0,
      notes: `Estado Actual: Protección de datos básica. Políticas básicas según Ley 1581/2012, cumplimiento parcial. Consentimiento informado básico, sin auditorías regulares.

Evidencias: Políticas_Proteccion_Datos_Basicas.pdf, Cumplimiento_Ley_1581.xlsx

Iniciativas: Mejorar políticas y cumplimiento en Q2 2026, sin inicio.

Métricas: Políticas: Básicas, Cumplimiento Ley 1581: Parcial, Consentimiento: Básico, Auditorías: 0.

Desafíos: Políticas básicas, cumplimiento parcial, sin auditorías.

Mejoras Futuras: Políticas completas, cumplimiento total, consentimiento robusto, auditorías regulares.`
    },
    'D12.3': {
      value: 2.5,
      notes: `Estado Actual: Cumplimiento normativa ambiental básico. Permisos ambientales vigentes, cumplimiento Ley 99/1993 parcial. Gestión de residuos básica, reporte anual a autoridades.

Evidencias: Permisos_Ambientales_2026.pdf, Cumplimiento_Ley_99.xlsx, Reporte_Anual_2025.pdf

Iniciativas: Mejorar cumplimiento y gestión de residuos en Q2 2026, sin inicio.

Métricas: Permisos: Vigentes, Cumplimiento Ley 99: Parcial, Gestión residuos: Básica, Reporte: Anual.

Desafíos: Cumplimiento parcial, gestión básica.

Mejoras Futuras: Cumplimiento total, gestión avanzada de residuos, reporte más frecuente.`
    },
    'D12.4': {
      value: 1.5,
      notes: `Estado Actual: Cumplimiento regulación energética básico. Cumplimiento Ley 1715/2014 parcial, algunos incentivos aprovechados. Reporte consumo básico, sin planes de eficiencia estructurados.

Evidencias: Cumplimiento_Ley_1715.xlsx, Incentivos_Aprovechados.pdf

Iniciativas: Mejorar cumplimiento y aprovechar más incentivos en Q3 2026, sin inicio.

Métricas: Cumplimiento Ley 1715: Parcial, Incentivos: Algunos, Reporte: Básico, Planes eficiencia: 0.

Desafíos: Cumplimiento parcial, incentivos limitados, sin planes.

Mejoras Futuras: Cumplimiento total, más incentivos, planes de eficiencia estructurados.`
    },
    'D12.5': {
      value: 1.5,
      notes: `Estado Actual: Cumplimiento ciberseguridad básico. Cumplimiento Decreto 1078/2015 parcial, políticas básicas. Reporte de incidentes básico, sin certificaciones.

Evidencias: Cumplimiento_Decreto_1078.xlsx, Políticas_Ciberseguridad_Basicas.pdf

Iniciativas: Mejorar cumplimiento en Q2 2026, sin inicio.

Métricas: Cumplimiento Decreto 1078: Parcial, Políticas: Básicas, Reporte incidentes: Básico, Certificaciones: 0.

Desafíos: Cumplimiento parcial, políticas básicas, sin certificaciones.

Mejoras Futuras: Cumplimiento total, políticas completas, certificaciones.`
    },
    'D12.6': {
      value: 2.0,
      notes: `Estado Actual: Continuidad operativa básica. Plan básico documentado, sin pruebas regulares. RTO: 8 horas (objetivo: <4 horas), backup básico, sin disaster recovery completo.

Evidencias: Plan_Continuidad_Basico.pdf, Backup_Basico.xlsx

Iniciativas: Mejorar plan y reducir RTO en Q2 2026, sin inicio.

Métricas: Plan: Básico, Pruebas: 0, RTO: 8 horas, Objetivo: <4 horas, DR: Incompleto.

Desafíos: Plan básico, sin pruebas, RTO alto, DR incompleto.

Mejoras Futuras: Plan completo, pruebas trimestrales, RTO <4 horas, DR completo.`
    }
  }
};

async function crearCasoEstudio() {
  console.log('🏭 Creando Caso de Estudio: Empresa con Automatización en Islas\n');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  try {
    // 1. Usar tenant y usuario existente de simulación
    console.log('1️⃣  Usando tenant y usuario de simulación...');
    const tenant = await prisma.tenant.findUnique({
      where: { id: 'simulacion-tenant' },
    });

    if (!tenant) {
      throw new Error('Tenant de simulación no encontrado. Ejecuta primero: npx tsx scripts/simular-evaluacion-dma.ts');
    }

    const user = await prisma.user.findUnique({
      where: { email: 'simulacion@dma.test' },
    });

    if (!user) {
      throw new Error('Usuario de simulación no encontrado. Ejecuta primero: npx tsx scripts/simular-evaluacion-dma.ts');
    }

    console.log(`   ✅ Tenant: ${tenant.name}`);
    console.log(`   ✅ Usuario: ${user.email}\n`);

    // 2. Crear evaluación (eliminar evaluación anterior si existe con el mismo nombre)
    console.log('2️⃣  Creando evaluación...');
    
    // Eliminar evaluación anterior si existe
    const existingEval = await prisma.evaluation.findFirst({
      where: {
        tenantId: tenant.id,
        name: 'Evaluación DMA - Automatización en Islas (Caso de Estudio)',
      },
    });

    if (existingEval) {
      console.log(`   ⚠️  Eliminando evaluación anterior: ${existingEval.id}`);
      await prisma.evaluation.delete({
        where: { id: existingEval.id },
      });
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        name: 'Evaluación DMA - Automatización en Islas (Caso de Estudio)',
        company: 'Industrias Colombianas S.A.',
        sector: 'Manufactura',
        tenantId: tenant.id,
        createdById: user.id,
        status: 'IN_PROGRESS',
      },
    });

    console.log(`   ✅ Evaluación creada: ${evaluation.name}`);
    console.log(`   ✅ ID: ${evaluation.id}\n`);

    // 3. Inicializar dimensiones
    console.log('3️⃣  Inicializando dimensiones y subcriterios...');
    await initializeDimensions(evaluation.id);
    const dimensions = await prisma.dimension.findMany({
      where: { evaluationId: evaluation.id },
      include: { subcriteria: true },
      orderBy: { code: 'asc' },
    });

    console.log(`   ✅ ${dimensions.length} dimensiones inicializadas`);
    console.log(`   ✅ ${dimensions.reduce((sum, d) => sum + d.subcriteria.length, 0)} subcriterios creados\n`);

    // 4. Crear respuestas detalladas
    console.log('4️⃣  Creando respuestas detalladas...');
    let totalResponses = 0;

    for (const dimension of dimensions) {
      const dimData = RESPONSES_DATA[dimension.code];
      if (!dimData) {
        console.warn(`   ⚠️  No hay datos para dimensión ${dimension.code}`);
        continue;
      }

      for (const subcriterion of dimension.subcriteria) {
        const subData = dimData[subcriterion.code];
        if (!subData) {
          console.warn(`   ⚠️  No hay datos para subcriterio ${subcriterion.code}`);
          continue;
        }

        await prisma.response.create({
          data: {
            evaluationId: evaluation.id,
            dimensionId: dimension.id,
            subcriterionId: subcriterion.id,
            value: subData.value,
            notes: subData.notes,
            answeredById: user.id,
          },
        });
        totalResponses++;
      }
    }

    console.log(`   ✅ ${totalResponses} respuestas creadas con notas detalladas\n`);

    // 5. Calcular madurez
    console.log('5️⃣  Calculando madurez...');
    const maturityResult = await calculateGlobalMaturity(evaluation.id);

    const updatedEvaluation = await prisma.evaluation.findUnique({
      where: { id: evaluation.id },
    });

    console.log(`   📊 Madurez Global: ${maturityResult.globalMaturity.toFixed(2)} / 5.0`);
    console.log(`   📈 Clasificación: ${updatedEvaluation?.classification || 'Pendiente'}`);
    console.log('\n   Madurez por Dimensión:');
    for (const [code, maturity] of Object.entries(maturityResult.dimensionMaturity)) {
      const dim = dimensions.find((d) => d.code === code);
      console.log(`      ${code}: ${maturity.toFixed(2)} - ${dim?.name || ''}`);
    }
    console.log('');

    // 6. Validar coherencia
    console.log('6️⃣  Validando coherencia...');
    const coherenceResult = await validateCoherence(
      evaluation.id,
      maturityResult.dimensionMaturity
    );

    console.log(`   📊 Score de Coherencia: ${(coherenceResult.score * 100).toFixed(1)}%`);
    console.log(`   📈 Estado: ${coherenceResult.status}`);
    console.log(`   ⚠️  Alertas: ${coherenceResult.alerts.length}`);

    if (coherenceResult.alerts.length > 0) {
      console.log('\n   Alertas detectadas:');
      coherenceResult.alerts.forEach((alert, index) => {
        console.log(`      ${index + 1}. [${alert.type.toUpperCase()}] ${alert.message}`);
        console.log(`         Regla: ${alert.rule}`);
        console.log(`         Sugerencia: ${alert.suggestion}`);
      });
    }
    console.log('');

    // 7. Crear configuración económica para el caso de estudio (COP)
    console.log('7️⃣  Creando configuración económica...');
    try {
      await prisma.economicConfig.upsert({
        where: { evaluationId: evaluation.id },
        update: {
          currency: 'COP',
          costPerMonth: 200000000, // 200M COP por mes
          valuePerMaturityPoint: 600000000, // 600M COP por punto de madurez
          exchangeRate: null,
          quickWinThreshold: 0.2,
          maxQuickWinMonths: 3,
          updatedById: user.id,
        },
        create: {
          evaluationId: evaluation.id,
          currency: 'COP',
          costPerMonth: 200000000, // 200M COP por mes
          valuePerMaturityPoint: 600000000, // 600M COP por punto de madurez
          exchangeRate: null,
          quickWinThreshold: 0.2,
          maxQuickWinMonths: 3,
          updatedById: user.id,
        },
      });
      console.log('   ✅ Configuración económica creada (COP)');
    } catch (error) {
      console.warn('   ⚠️  Error al crear configuración económica:', error);
    }
    console.log('');

    // 8. Generar roadmap
    console.log('8️⃣  Generando roadmap...');
    const roadmapResult = await generateRoadmapService(
      evaluation.id,
      maturityResult.globalMaturity,
      dimensions.map(d => ({
        code: d.code,
        name: d.name,
        maturity: maturityResult.dimensionMaturity[d.code] || 0,
      })),
      {
        targetMaturity: 4.0,
        timeframe: 36,
        budget: 2000000,
      },
      tenant.id // Pasar tenantId
    );

    // Guardar roadmap
    await prisma.roadmap.upsert({
      where: { evaluationId: evaluation.id },
      update: {
        phases: roadmapResult.phases as any,
        totalROI: roadmapResult.totalROI,
        totalInvestment: roadmapResult.totalInvestment,
        totalAnnualValue: roadmapResult.totalAnnualValue,
      },
      create: {
        evaluationId: evaluation.id,
        phases: roadmapResult.phases as any,
        totalROI: roadmapResult.totalROI,
        totalInvestment: roadmapResult.totalInvestment,
        totalAnnualValue: roadmapResult.totalAnnualValue,
      },
    });

    const currency = roadmapResult.currency || 'COP';
    const currencySymbol = currency === 'COP' ? 'COP' : currency === 'USD' ? 'USD' : currency;
    
    console.log(`   ✅ Roadmap generado con ${roadmapResult.phases.length} fases`);
    console.log(`   💰 Inversión Total: ${currencySymbol} ${roadmapResult.totalInvestment?.toLocaleString() || 'N/A'}`);
    console.log(`   📈 ROI Total: ${((roadmapResult.totalROI || 0) * 100).toFixed(1)}%`);
    console.log(`   💵 Valor Anual: ${currencySymbol} ${roadmapResult.totalAnnualValue?.toLocaleString() || 'N/A'}`);
    console.log(`   💱 Moneda: ${currency}`);
    console.log('');

    // 9. Resumen final
    console.log('📋 RESUMEN DEL CASO DE ESTUDIO');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log(`Empresa: ${evaluation.company}`);
    console.log(`Evaluación: ${evaluation.name}`);
    console.log(`Sector: ${evaluation.sector}`);
    console.log(`Estado: ${evaluation.status}`);
    console.log(`Madurez Global: ${maturityResult.globalMaturity.toFixed(2)} / 5.0`);
    console.log(`Clasificación: ${updatedEvaluation?.classification || 'Pendiente'}`);
    console.log(`Coherencia: ${(coherenceResult.score * 100).toFixed(1)}% (${coherenceResult.status})`);
    console.log(`Dimensiones evaluadas: ${dimensions.length}`);
    console.log(`Subcriterios evaluados: ${totalResponses}`);
    console.log(`Alertas: ${coherenceResult.alerts.length}`);
    console.log(`Roadmap: ${roadmapResult.phases.length} fases generadas`);
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    console.log('✅ Caso de estudio creado exitosamente!');
    console.log(`\n🔗 Para ver la evaluación:`);
    console.log(`   Frontend: http://localhost:3000/evaluations/${evaluation.id}`);
    console.log(`   O usar Prisma Studio: npx prisma studio`);
    console.log(`\n📊 Para generar reporte PDF:`);
    console.log(`   Desde la aplicación: Navegar a Reportes → Seleccionar evaluación → Generar`);
    console.log(`\n📈 Roadmap disponible en:`);
    console.log(`   Dashboard → Pestaña Roadmap`);

    return {
      evaluation: updatedEvaluation || evaluation,
      maturityResult,
      coherenceResult,
      roadmapResult,
      dimensions,
      totalResponses,
    };
  } catch (error) {
    console.error('❌ Error en la creación del caso de estudio:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
crearCasoEstudio()
  .then(() => {
    console.log('\n🎉 Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
