import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RoadmapOptions {
  targetMaturity: number;
  timeframe: number; // meses
  budget?: number;
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
}> {
  // Obtener configuración económica
  const economicConfig = await getEconomicConfig(evaluationId, tenantId);

  // Identificar gaps
  // Si la madurez es 0 o null, considerar que todas las dimensiones tienen gap
  const gaps = dimensions
    .map((dim) => {
      const currentMaturity = dim.maturity != null ? dim.maturity : 0;
      const gap = Math.max(0, options.targetMaturity - currentMaturity);
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
  // Esto puede pasar si targetMaturity es muy bajo o todas las dimensiones ya están en el target
  // Pero normalmente con madurez 0, todas deberían tener gap > 0
  if (gaps.length === 0 && dimensions.length > 0) {
    // Si no hay gaps pero hay dimensiones, crear mejoras para todas (caso especial)
    // Esto puede pasar si targetMaturity es 0 o muy bajo
    const allGaps = dimensions.map((dim) => {
      const currentMaturity = dim.maturity != null ? dim.maturity : 0;
      return {
        code: dim.code,
        name: dim.name,
        current: currentMaturity,
        gap: Math.max(0.1, options.targetMaturity || 4.0 - currentMaturity), // Mínimo gap de 0.1
      };
    });
    gaps.push(...allGaps);
    gaps.sort((a, b) => b.gap - a.gap);
  }

  // Generar mejoras basadas en gaps
  const improvements: Improvement[] = [];

  for (const gap of gaps.slice(0, 10)) {
    // Estimar esfuerzo basado en gap
    const effortMonths = Math.ceil(gap.gap * 2); // Aproximación
    
    // Usar configuración económica dinámica
    const cost = effortMonths * economicConfig.costPerMonth;
    const annualValue = gap.gap * economicConfig.valuePerMaturityPoint;
    const roi = (annualValue - cost) / cost;

    improvements.push({
      id: `improvement-${gap.code}`,
      title: `Mejorar ${gap.name}`,
      description: `Aumentar madurez de ${gap.current.toFixed(2)} a ${options.targetMaturity.toFixed(2)}`,
      dimensions: [gap.code],
      currentMaturity: gap.current,
      targetMaturity: options.targetMaturity,
      effort: {
        months: effortMonths,
        cost,
        resources: ['1 desarrollador', '1 analista'],
      },
      roi: {
        estimated: roi,
        paybackMonths: cost / (annualValue / 12),
        annualValue,
      },
      dependencies: [],
    });
  }

  // MEJORADA: Lógica más flexible para Quick Wins
  // Calcular ratio ROI/Esfuerzo para cada mejora
  const improvementsWithRatio = improvements.map((imp) => ({
    ...imp,
    roiEffortRatio: imp.roi.estimated / imp.effort.months, // ROI por mes
  }));

  // Identificar quick wins con lógica más flexible
  // Opción 1: Mejoras que cumplen criterios estrictos
  const strictQuickWins = improvementsWithRatio
    .filter(
      (imp) =>
        imp.effort.months <= economicConfig.maxQuickWinMonths &&
        imp.roi.estimated > economicConfig.quickWinThreshold
    )
    .sort((a, b) => b.roiEffortRatio - a.roiEffortRatio);

  // Opción 2: Si no hay suficientes, agregar mejores por ratio ROI/Esfuerzo
  let quickWins = [...strictQuickWins];
  
  if (quickWins.length < 3) {
    // Agregar mejoras con mejor ratio, aunque no cumplan todos los criterios
    const additionalQuickWins = improvementsWithRatio
      .filter((imp) => !quickWins.includes(imp))
      .sort((a, b) => b.roiEffortRatio - a.roiEffortRatio)
      .slice(0, 5 - quickWins.length);
    
    quickWins = [...quickWins, ...additionalQuickWins];
  }

  // Limitar a 5 quick wins máximo
  quickWins = quickWins.slice(0, 5);

  // Si aún no hay quick wins, tomar las 3 mejores por ratio
  if (quickWins.length === 0) {
    quickWins = improvementsWithRatio
      .sort((a, b) => b.roiEffortRatio - a.roiEffortRatio)
      .slice(0, 3);
  }

  // Organizar en fases
  const phases: RoadmapPhase[] = [
    {
      phase: 'Quick Wins',
      duration: '0-3 meses',
      improvements: quickWins.map((qw) => ({
        id: qw.id,
        title: qw.title,
        description: qw.description,
        dimensions: qw.dimensions,
        currentMaturity: qw.currentMaturity,
        targetMaturity: qw.targetMaturity,
        effort: qw.effort,
        roi: qw.roi,
        dependencies: qw.dependencies,
      })),
      currency: economicConfig.currency,
    },
    {
      phase: 'Fundamentos',
      duration: '3-6 meses',
      improvements: improvements
        .filter((imp) => !quickWins.some((qw) => qw.id === imp.id) && imp.effort.months <= 6)
        .slice(0, 5),
      currency: economicConfig.currency,
    },
    {
      phase: 'Integración',
      duration: '6-12 meses',
      improvements: improvements
        .filter((imp) => imp.effort.months > 6 && imp.effort.months <= 12)
        .slice(0, 5),
      currency: economicConfig.currency,
    },
  ];

  // Calcular totales
  const totalInvestment = improvements.reduce((sum, imp) => sum + imp.effort.cost, 0);
  const totalAnnualValue = improvements.reduce((sum, imp) => sum + imp.roi.annualValue, 0);
  const totalROI = totalInvestment > 0 ? (totalAnnualValue - totalInvestment) / totalInvestment : 0;

  return {
    phases,
    totalROI,
    totalInvestment,
    totalAnnualValue,
    currency: economicConfig.currency,
  };
}
