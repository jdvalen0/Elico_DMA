import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definición de dimensiones y subcriterios según el modelo ELICO 4.0
const DIMENSIONS_CONFIG = [
  {
    code: 'D01',
    name: 'Estrategia y Gobierno Digital',
    weight: 0.15,
    subcriteria: [
      { code: 'D01.1', name: 'Visión 4.0', weight: 0.25 },
      { code: 'D01.2', name: 'Roadmap estratégico', weight: 0.20 },
      { code: 'D01.3', name: 'Presupuesto digital', weight: 0.20 },
      { code: 'D01.4', name: 'Liderazgo comprometido', weight: 0.20 },
      { code: 'D01.5', name: 'KPIs estratégicos', weight: 0.15 },
    ],
  },
  {
    code: 'D02',
    name: 'Talento y Cultura Organizacional',
    weight: 0.10,
    subcriteria: [
      { code: 'D02.1', name: 'Capacitación digital', weight: 0.25 },
      { code: 'D02.2', name: 'Cultura de innovación', weight: 0.20 },
      { code: 'D02.3', name: 'Retención de talento', weight: 0.20 },
      { code: 'D02.4', name: 'Liderazgo técnico', weight: 0.20 },
      { code: 'D02.5', name: 'Cambio organizacional', weight: 0.15 },
    ],
  },
  {
    code: 'D03',
    name: 'Arquitectura OT/IT',
    weight: 0.12,
    subcriteria: [
      { code: 'D03.1', name: 'Convergencia OT-IT', weight: 0.25 },
      { code: 'D03.2', name: 'Arquitectura de sistemas', weight: 0.20 },
      { code: 'D03.3', name: 'Integración de datos', weight: 0.20 },
      { code: 'D03.4', name: 'Cloud/Edge computing', weight: 0.15 },
      { code: 'D03.5', name: 'Estándares tecnológicos', weight: 0.20 },
    ],
  },
  {
    code: 'D04',
    name: 'Redes Industriales',
    weight: 0.08,
    subcriteria: [
      { code: 'D04.1', name: 'Conectividad de planta', weight: 0.25 },
      { code: 'D04.2', name: 'Protocolos industriales', weight: 0.20 },
      { code: 'D04.3', name: 'Ancho de banda', weight: 0.20 },
      { code: 'D04.4', name: 'Redundancia', weight: 0.20 },
      { code: 'D04.5', name: 'QoS', weight: 0.15 },
    ],
  },
  {
    code: 'D05',
    name: 'Ciberseguridad Industrial',
    weight: 0.12,
    subcriteria: [
      { code: 'D05.1', name: 'Seguridad OT (IEC 62443)', weight: 0.25 },
      { code: 'D05.2', name: 'Seguridad IT', weight: 0.20 },
      { code: 'D05.3', name: 'Gestión de identidades', weight: 0.20 },
      { code: 'D05.4', name: 'Monitoreo de amenazas', weight: 0.20 },
      { code: 'D05.5', name: 'Respuesta a incidentes', weight: 0.15 },
    ],
  },
  {
    code: 'D06',
    name: 'Gestión de Datos e IA',
    weight: 0.10,
    subcriteria: [
      { code: 'D06.1', name: 'Captura de datos', weight: 0.20 },
      { code: 'D06.2', name: 'Almacenamiento', weight: 0.15 },
      { code: 'D06.3', name: 'Procesamiento', weight: 0.15 },
      { code: 'D06.4', name: 'Analytics', weight: 0.20 },
      { code: 'D06.5', name: 'Machine Learning', weight: 0.15 },
      { code: 'D06.6', name: 'IA aplicada', weight: 0.15 },
    ],
  },
  {
    code: 'D07',
    name: 'Procesos Productivos',
    weight: 0.10,
    subcriteria: [
      { code: 'D07.1', name: 'Optimización de procesos', weight: 0.25 },
      { code: 'D07.2', name: 'Lean Manufacturing', weight: 0.20 },
      { code: 'D07.3', name: 'Flexibilidad', weight: 0.20 },
      { code: 'D07.4', name: 'Trazabilidad', weight: 0.20 },
      { code: 'D07.5', name: 'Calidad en proceso', weight: 0.15 },
    ],
  },
  {
    code: 'D08',
    name: 'Automatización y Control',
    weight: 0.10,
    subcriteria: [
      { code: 'D08.1', name: 'Nivel de automatización', weight: 0.25 },
      { code: 'D08.2', name: 'PLC/SCADA', weight: 0.20 },
      { code: 'D08.3', name: 'Control avanzado', weight: 0.20 },
      { code: 'D08.4', name: 'HMI', weight: 0.15 },
      { code: 'D08.5', name: 'Integración de sistemas', weight: 0.20 },
    ],
  },
  {
    code: 'D09',
    name: 'Mantenimiento y Confiabilidad',
    weight: 0.08,
    subcriteria: [
      { code: 'D09.1', name: 'Estrategia de mantenimiento', weight: 0.25 },
      { code: 'D09.2', name: 'CMMS', weight: 0.20 },
      { code: 'D09.3', name: 'Mantenimiento predictivo', weight: 0.20 },
      { code: 'D09.4', name: 'Gestión de repuestos', weight: 0.15 },
      { code: 'D09.5', name: 'Confiabilidad', weight: 0.20 },
    ],
  },
  {
    code: 'D10',
    name: 'Gestión Energética y Sostenibilidad',
    weight: 0.07,
    subcriteria: [
      { code: 'D10.1', name: 'Monitoreo energético', weight: 0.25 },
      { code: 'D10.2', name: 'Eficiencia energética', weight: 0.20 },
      { code: 'D10.3', name: 'Gestión de demanda', weight: 0.20 },
      { code: 'D10.4', name: 'Renovables', weight: 0.15 },
      { code: 'D10.5', name: 'Huella de carbono', weight: 0.20 },
    ],
  },
  {
    code: 'D11',
    name: 'Calidad y Cumplimiento',
    weight: 0.06,
    subcriteria: [
      { code: 'D11.1', name: 'Sistemas de calidad', weight: 0.25 },
      { code: 'D11.2', name: 'Trazabilidad', weight: 0.20 },
      { code: 'D11.3', name: 'Certificaciones', weight: 0.20 },
      { code: 'D11.4', name: 'Control estadístico', weight: 0.20 },
      { code: 'D11.5', name: 'Mejora continua', weight: 0.15 },
    ],
  },
  {
    code: 'D12',
    name: 'Cumplimiento Normativo Colombiano 2026',
    weight: 0.12,
    subcriteria: [
      { code: 'D12.1', name: 'SG-SST', weight: 0.25 },
      { code: 'D12.2', name: 'Protección de datos', weight: 0.15 },
      { code: 'D12.3', name: 'Normativa ambiental', weight: 0.20 },
      { code: 'D12.4', name: 'Regulación energética', weight: 0.10 },
      { code: 'D12.5', name: 'Ciberseguridad', weight: 0.20 },
      { code: 'D12.6', name: 'Continuidad operativa', weight: 0.10 },
    ],
  },
];

export async function initializeDimensions(evaluationId: string) {
  for (const dimConfig of DIMENSIONS_CONFIG) {
    const dimension = await prisma.dimension.create({
      data: {
        evaluationId,
        code: dimConfig.code,
        name: dimConfig.name,
        weight: dimConfig.weight,
      },
    });

    for (const subConfig of dimConfig.subcriteria) {
      await prisma.subcriterion.create({
        data: {
          dimensionId: dimension.id,
          code: subConfig.code,
          name: subConfig.name,
          weight: subConfig.weight,
        },
      });
    }
  }
}
