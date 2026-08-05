import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type CompanySize = 'small' | 'medium' | 'large';

interface RoadmapOptions {
  targetMaturity: number;
  timeframe: number; // meses
  budget?: number;
  companySize?: CompanySize;
  priorities?: string[];
}

interface EconomicConfig {
  currency: string;
  costPerMonth: number;
  valuePerMaturityPoint: number;
  exchangeRate?: number | null;
  quickWinThreshold: number;
  maxQuickWinMonths: number;
}

interface Improvement {
  id: string;
  title: string;
  description: string;
  dimensions: string[];
  currentMaturity: number;
  targetMaturity: number;
  actions: string[];
  effort: {
    months: number;
    cost: number;
    resources: string[];
  };
  roi: {
    estimated: number;
    paybackMonths: number;
    annualValue: number;
  };
  dependencies: string[];
}

interface RoadmapPhase {
  phase: string;
  duration: string;
  improvements: Improvement[];
  currency?: string;
}

interface DimensionTemplate {
  actions: string[];
  resources: string[];
  // Factor de complejidad de implementación (infraestructura física cuesta más que cambios organizacionales)
  complexity: number;
  // Meses típicos por punto de madurez a ganar
  monthsPerPoint: number;
}

// Catálogo base de recomendaciones por dimensión. Punto de partida:
// está pensado para enriquecerse con la experiencia de implementaciones reales.
export const DIMENSION_TEMPLATES: Record<string, DimensionTemplate> = {
  D01: {
    actions: [
      'Definir o actualizar la visión de transformación digital con la alta dirección',
      'Construir un roadmap estratégico con hitos, fechas y responsables nombrados',
      'Establecer KPIs digitales con tablero de seguimiento y revisión periódica',
      'Formalizar presupuesto anual de transformación digital aprobado por junta',
    ],
    resources: ['Consultor de estrategia', 'PMO / líder de transformación', 'Sponsor ejecutivo'],
    complexity: 0.8,
    monthsPerPoint: 1.5,
  },
  D02: {
    actions: [
      'Diseñar plan de capacitación digital por roles (operarios, supervisores, directivos)',
      'Implementar programa de gestión del cambio con comunicadores por área',
      'Definir plan de retención y atracción de talento técnico',
    ],
    resources: ['Líder de RRHH', 'Academia / formador externo', 'Gestor del cambio'],
    complexity: 0.7,
    monthsPerPoint: 1.5,
  },
  D03: {
    actions: [
      'Documentar arquitectura OT/IT actual y definir arquitectura de referencia (modelo ISA-95)',
      'Implementar capa de integración de datos entre planta y sistemas empresariales',
      'Ejecutar piloto de cloud/edge computing para un caso de uso priorizado',
    ],
    resources: ['Arquitecto OT/IT', 'Integrador de sistemas'],
    complexity: 1.3,
    monthsPerPoint: 2.5,
  },
  D04: {
    actions: [
      'Realizar diagnóstico de la red de planta (topología, protocolos, puntos únicos de falla)',
      'Segmentar la red industrial (zonas y conductos) y separar OT de IT',
      'Actualizar infraestructura crítica: switches industriales, enlaces redundantes',
    ],
    resources: ['Ingeniero de redes industriales', 'Integrador de infraestructura'],
    complexity: 1.4,
    monthsPerPoint: 2.5,
  },
  D05: {
    actions: [
      'Ejecutar evaluación de riesgo de ciberseguridad industrial (referencia IEC 62443)',
      'Implementar segmentación de zonas y conductos con firewall industrial',
      'Establecer monitoreo de seguridad OT y plan de respuesta a incidentes',
    ],
    resources: ['Especialista en ciberseguridad OT', 'SOC / proveedor de monitoreo'],
    complexity: 1.3,
    monthsPerPoint: 2.0,
  },
  D06: {
    actions: [
      'Definir modelo de gobierno de datos (propietarios, calidad, catálogo)',
      'Implementar plataforma centralizada de datos de planta (historian / data lake)',
      'Ejecutar piloto de analítica o IA sobre un caso de uso con retorno claro',
    ],
    resources: ['Ingeniero de datos', 'Científico de datos / analista'],
    complexity: 1.1,
    monthsPerPoint: 2.0,
  },
  D07: {
    actions: [
      'Mapear y digitalizar procesos productivos clave (eliminando papel y doble digitación)',
      'Estandarizar procedimientos con instrucciones digitales en piso de planta',
      'Implantar rutinas de mejora continua con datos en tiempo real',
    ],
    resources: ['Analista de procesos', 'Líder de mejora continua'],
    complexity: 0.9,
    monthsPerPoint: 1.5,
  },
  D08: {
    actions: [
      'Elaborar plan maestro de automatización priorizado por retorno',
      'Modernizar sistemas de control obsoletos (PLC/SCADA) en las líneas críticas',
      'Implementar piloto de automatización avanzada (celda robotizada o control avanzado)',
    ],
    resources: ['Integrador de automatización', 'Ingeniero de control'],
    complexity: 1.4,
    monthsPerPoint: 2.5,
  },
  D09: {
    actions: [
      'Implementar o actualizar sistema de gestión de mantenimiento (GMAO/CMMS)',
      'Definir estrategia de mantenimiento por criticidad (RCM)',
      'Ejecutar piloto de mantenimiento predictivo con sensórica en activos críticos',
    ],
    resources: ['Planificador de mantenimiento', 'Proveedor de sensórica'],
    complexity: 1.2,
    monthsPerPoint: 2.0,
  },
  D10: {
    actions: [
      'Implementar sistema de gestión de energía alineado a ISO 50001',
      'Instalar medición energética por líneas/áreas con tableros de consumo',
      'Ejecutar proyecto de eficiencia energética con retorno medible',
    ],
    resources: ['Gestor energético', 'Proveedor de medición'],
    complexity: 1.1,
    monthsPerPoint: 1.8,
  },
  D11: {
    actions: [
      'Digitalizar el sistema de gestión de calidad (inspecciones, no conformidades)',
      'Implementar trazabilidad de producto y control estadístico de procesos (SPC)',
      'Integrar datos de calidad con producción para análisis de causas',
    ],
    resources: ['Líder de calidad', 'Proveedor MES / SPC'],
    complexity: 1.0,
    monthsPerPoint: 1.8,
  },
  D12: {
    actions: [
      'Realizar diagnóstico de cumplimiento normativo aplicable al sector',
      'Ejecutar plan de regularización de obligaciones pendientes',
      'Automatizar reportes regulatorios recurrentes',
    ],
    resources: ['Asesor legal / regulatorio', 'Consultor sectorial'],
    complexity: 0.9,
    monthsPerPoint: 1.5,
  },
};

const DEFAULT_TEMPLATE: DimensionTemplate = {
  actions: ['Definir plan de mejora específico para la dimensión con responsables y fechas'],
  resources: ['Equipo interno', 'Asesor externo'],
  complexity: 1.0,
  monthsPerPoint: 2.0,
};

// Factor de escala por tamaño de empresa: no cuesta lo mismo implementar
// en una planta pequeña que en una operación grande multi-sitio
const COMPANY_SIZE_FACTORS: Record<CompanySize, number> = {
  small: 0.5,
  medium: 1.0,
  large: 1.8,
};

const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  small: 'Pequeña (<50 empleados)',
  medium: 'Mediana (50-250 empleados)',
  large: 'Grande (>250 empleados o multi-sitio)',
};

// Obtener configuración económica (por evaluación o tenant)
async function getEconomicConfig(evaluationId: string, tenantId: string): Promise<EconomicConfig> {
  // Buscar configuración específica de evaluación
  let config = await prisma.economicConfig.findFirst({
    where: {
      evaluationId,
      evaluation: {
        tenantId,
      },
    },
  });

  // Si no hay configuración de evaluación, buscar por tenant
  if (!config) {
    config = await prisma.economicConfig.findFirst({
      where: {
        tenantId,
        evaluationId: null,
      },
    });
  }

  // Si no hay configuración, usar valores por defecto
  if (!config) {
    return {
      currency: 'USD',
      costPerMonth: 50000,
      valuePerMaturityPoint: 150000,
      exchangeRate: null,
      quickWinThreshold: 0.2,
      maxQuickWinMonths: 3,
    };
  }

  return {
    currency: config.currency,
    costPerMonth: config.costPerMonth,
    valuePerMaturityPoint: config.valuePerMaturityPoint,
    exchangeRate: config.exchangeRate,
    quickWinThreshold: config.quickWinThreshold,
    maxQuickWinMonths: config.maxQuickWinMonths,
  };
}

export async function generateRoadmapService(
  evaluationId: string,
  currentGlobalMaturity: number,
  dimensions: any[],
  options: RoadmapOptions,
  tenantId: string
): Promise<{
  phases: RoadmapPhase[];
  totalROI: number;
  totalInvestment: number;
  totalAnnualValue: number;
  currency: string;
  parameters: {
    companySize: CompanySize;
    companySizeLabel: string;
    sizeFactor: number;
    budget: number | null;
    targetMaturity: number;
    costPerMonth: number;
    valuePerMaturityPoint: number;
    disclaimer: string;
  };
  excludedByBudget: number;
  estimatesDisclaimer: string;
}> {
  const economicConfig = await getEconomicConfig(evaluationId, tenantId);
  const companySize: CompanySize = options.companySize || 'medium';
  const sizeFactor = COMPANY_SIZE_FACTORS[companySize];
  const targetMaturity = options.targetMaturity || 4.0;

  // Identificar gaps
  // Si la madurez es 0 o null, considerar que todas las dimensiones tienen gap
  const gaps = dimensions
    .map((dim) => {
      const currentMaturity = dim.maturity != null ? dim.maturity : 0;
      const gap = Math.max(0, targetMaturity - currentMaturity);
      return {
        code: dim.code,
        name: dim.name,
        current: currentMaturity,
        gap: gap,
      };
    })
    .filter((g) => g.gap > 0) // Solo dimensiones con gap positivo
    .sort((a, b) => b.gap - a.gap);

  // Si no hay gaps (todas las dimensiones están en el target), crear mejoras para todas
  if (gaps.length === 0 && dimensions.length > 0) {
    const allGaps = dimensions.map((dim) => {
      const currentMaturity = dim.maturity != null ? dim.maturity : 0;
      return {
        code: dim.code,
        name: dim.name,
        current: currentMaturity,
        gap: Math.max(0.1, targetMaturity - currentMaturity),
      };
    });
    gaps.push(...allGaps);
    gaps.sort((a, b) => b.gap - a.gap);
  }

  // Generar mejoras basadas en gaps y plantillas por dimensión
  const improvements: Improvement[] = [];

  for (const gap of gaps.slice(0, 10)) {
    const template = DIMENSION_TEMPLATES[gap.code] || DEFAULT_TEMPLATE;

    // Esfuerzo: meses por punto de madurez según tipo de dimensión
    const effortMonths = Math.max(1, Math.ceil(gap.gap * template.monthsPerPoint));

    // Costo paramétrico: esfuerzo × costo mensual × complejidad de la dimensión × tamaño de empresa
    const cost = Math.round(
      effortMonths * economicConfig.costPerMonth * template.complexity * sizeFactor
    );

    // Valor anual estimado: puntos ganados × valor por punto × escala de la operación
    const annualValue = Math.round(
      gap.gap * economicConfig.valuePerMaturityPoint * sizeFactor
    );

    const roi = cost > 0 ? (annualValue - cost) / cost : 0;

    improvements.push({
      id: `improvement-${gap.code}`,
      title: `Mejorar ${gap.name}`,
      description: `Aumentar madurez de ${gap.current.toFixed(2)} a ${targetMaturity.toFixed(2)}`,
      dimensions: [gap.code],
      currentMaturity: gap.current,
      targetMaturity,
      actions: template.actions,
      effort: {
        months: effortMonths,
        cost,
        resources: template.resources,
      },
      roi: {
        estimated: roi,
        paybackMonths: annualValue > 0 ? cost / (annualValue / 12) : Infinity,
        annualValue,
      },
      dependencies: [],
    });
  }

  // Calcular ratio ROI/Esfuerzo para cada mejora
  const improvementsWithRatio = improvements.map((imp) => ({
    ...imp,
    roiEffortRatio: imp.roi.estimated / imp.effort.months, // ROI por mes
  }));

  // Restricción de presupuesto (opcional): selección voraz por ratio ROI/Esfuerzo
  let budgetImprovements = improvementsWithRatio;
  let excludedByBudget = 0;
  if (options.budget && options.budget > 0) {
    const sortedByRatio = [...improvementsWithRatio].sort(
      (a, b) => b.roiEffortRatio - a.roiEffortRatio
    );
    let remaining = options.budget;
    budgetImprovements = [];
    for (const imp of sortedByRatio) {
      if (imp.effort.cost <= remaining) {
        budgetImprovements.push(imp);
        remaining -= imp.effort.cost;
      } else {
        excludedByBudget++;
      }
    }
    // Mantener orden por gap para las fases
    budgetImprovements.sort(
      (a, b) =>
        improvementsWithRatio.indexOf(a) - improvementsWithRatio.indexOf(b)
    );
  }

  // Identificar quick wins con lógica flexible
  const strictQuickWins = budgetImprovements
    .filter(
      (imp) =>
        imp.effort.months <= economicConfig.maxQuickWinMonths &&
        imp.roi.estimated > economicConfig.quickWinThreshold
    )
    .sort((a, b) => b.roiEffortRatio - a.roiEffortRatio);

  // Si no hay suficientes, agregar mejores por ratio ROI/Esfuerzo
  let quickWins = [...strictQuickWins];

  if (quickWins.length < 3) {
    const additionalQuickWins = budgetImprovements
      .filter((imp) => !quickWins.includes(imp))
      .sort((a, b) => b.roiEffortRatio - a.roiEffortRatio)
      .slice(0, 5 - quickWins.length);

    quickWins = [...quickWins, ...additionalQuickWins];
  }

  // Limitar a 5 quick wins máximo
  quickWins = quickWins.slice(0, 5);

  const toImprovement = (qw: (typeof improvementsWithRatio)[number]): Improvement => ({
    id: qw.id,
    title: qw.title,
    description: qw.description,
    dimensions: qw.dimensions,
    currentMaturity: qw.currentMaturity,
    targetMaturity: qw.targetMaturity,
    actions: qw.actions,
    effort: qw.effort,
    roi: qw.roi,
    dependencies: qw.dependencies,
  });

  // Organizar en fases
  const phases: RoadmapPhase[] = [
    {
      phase: 'Quick Wins',
      duration: '0-3 meses',
      improvements: quickWins.map(toImprovement),
      currency: economicConfig.currency,
    },
    {
      phase: 'Fundamentos',
      duration: '3-6 meses',
      improvements: budgetImprovements
        .filter((imp) => !quickWins.some((qw) => qw.id === imp.id) && imp.effort.months <= 6)
        .slice(0, 5)
        .map(toImprovement),
      currency: economicConfig.currency,
    },
    {
      phase: 'Integración',
      duration: '6-12 meses',
      improvements: budgetImprovements
        .filter((imp) => imp.effort.months > 6 && imp.effort.months <= 12)
        .slice(0, 5)
        .map(toImprovement),
      currency: economicConfig.currency,
    },
  ];

  // Calcular totales
  const totalInvestment = budgetImprovements.reduce((sum, imp) => sum + imp.effort.cost, 0);
  const totalAnnualValue = budgetImprovements.reduce((sum, imp) => sum + imp.roi.annualValue, 0);
  const totalROI = totalInvestment > 0 ? (totalAnnualValue - totalInvestment) / totalInvestment : 0;

  const estimatesDisclaimer =
    'Las estimaciones de costo, esfuerzo y ROI son referenciales: se calculan a partir de los parámetros ingresados (tamaño de empresa, presupuesto) y valores configurables. No constituyen una cotización; deben validarse con cotizaciones reales por proyecto.';

  return {
    phases,
    totalROI,
    totalInvestment,
    totalAnnualValue,
    currency: economicConfig.currency,
    parameters: {
      companySize,
      companySizeLabel: COMPANY_SIZE_LABELS[companySize],
      sizeFactor,
      budget: options.budget && options.budget > 0 ? options.budget : null,
      targetMaturity,
      costPerMonth: economicConfig.costPerMonth,
      valuePerMaturityPoint: economicConfig.valuePerMaturityPoint,
      disclaimer: estimatesDisclaimer,
    },
    excludedByBudget,
    estimatesDisclaimer,
  };
}
