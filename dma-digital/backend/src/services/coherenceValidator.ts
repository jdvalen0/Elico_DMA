import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CoherenceAlert {
  type: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  dimensions: string[];
  rule: string;
  suggestion: string;
}

export async function validateCoherence(
  evaluationId: string,
  dimensionMaturity: Record<string, number>
): Promise<{
  score: number;
  status: 'coherent' | 'incoherent' | 'critical';
  alerts: CoherenceAlert[];
}> {
  const alerts: CoherenceAlert[] = [];

  // Obtener conteo de respuestas por dimensión para evitar alertas falsas en dimensiones no evaluadas
  const responseCounts = await prisma.response.groupBy({
    by: ['dimensionId'],
    where: { evaluationId },
    _count: { id: true },
  });

  const dimensionsWithResponses = await prisma.dimension.findMany({
    where: { evaluationId },
    select: { id: true, code: true },
  });

  const activeCodes = new Set<string>();
  dimensionsWithResponses.forEach((dim) => {
    const hasResp = responseCounts.some((rc) => rc.dimensionId === dim.id && rc._count.id > 0);
    if (hasResp) {
      activeCodes.add(dim.code);
    }
  });

  // Regla RN-006: Si Ciberseguridad < 2.0, alerta de riesgo crítico
  if (activeCodes.has('D05') && (dimensionMaturity['D05'] || 0) < 2.0) {
    alerts.push({
      type: 'critical',
      message: 'Ciberseguridad Industrial por debajo del nivel mínimo recomendado',
      dimensions: ['D05'],
      rule: 'RN-006',
      suggestion: 'Priorizar mejoras en ciberseguridad. Nivel actual representa riesgo crítico.',
    });
  }

  // Regla RN-007: Si Arquitectura OT/IT > 3.0, entonces Redes Industriales debe ser > 2.5
  if (
    activeCodes.has('D03') &&
    activeCodes.has('D04') &&
    (dimensionMaturity['D03'] || 0) > 3.0 &&
    (dimensionMaturity['D04'] || 0) <= 2.5
  ) {
    alerts.push({
      type: 'high',
      message: 'Incoherencia entre Arquitectura OT/IT y Redes Industriales',
      dimensions: ['D03', 'D04'],
      rule: 'RN-007',
      suggestion: 'Si Arquitectura OT/IT es > 3.0, Redes Industriales debe ser > 2.5. Revisar respuestas de Redes Industriales.',
    });
  }

  // Regla RN-008: Si Automatización > 4.0, entonces Procesos debe ser > 3.0
  if (
    activeCodes.has('D08') &&
    activeCodes.has('D07') &&
    (dimensionMaturity['D08'] || 0) > 4.0 &&
    (dimensionMaturity['D07'] || 0) <= 3.0
  ) {
    alerts.push({
      type: 'high',
      message: 'Incoherencia entre Automatización y Procesos',
      dimensions: ['D07', 'D08'],
      rule: 'RN-008',
      suggestion: 'Si Automatización es > 4.0, Procesos debe ser > 3.0. Revisar respuestas de Procesos Productivos.',
    });
  }

  // Regla RN-009: Si Estrategia > 3.0, entonces al menos 3 dimensiones operativas deben ser > 2.5
  if (activeCodes.has('D01') && (dimensionMaturity['D01'] || 0) > 3.0) {
    const operationalDimensions = ['D07', 'D08', 'D09', 'D10', 'D11'];
    const operationalAboveThreshold = operationalDimensions.filter(
      (code) => activeCodes.has(code) && (dimensionMaturity[code] || 0) > 2.5
    ).length;

    // Solo evaluar si al menos 3 dimensiones operativas tienen respuestas
    const operationalWithResponses = operationalDimensions.filter((code) => activeCodes.has(code)).length;

    if (operationalWithResponses >= 3 && operationalAboveThreshold < 3) {
      alerts.push({
        type: 'medium',
        message: 'Estrategia avanzada pero implementación operativa limitada',
        dimensions: ['D01', ...operationalDimensions],
        rule: 'RN-009',
        suggestion: 'Si Estrategia es > 3.0, al menos 3 dimensiones operativas deben ser > 2.5. Revisar implementación operativa.',
      });
    }
  }

  // Calcular score de coherencia
  const techDimensions = ['D03', 'D04', 'D05', 'D06'];
  const techMaturities = techDimensions.map((code) => dimensionMaturity[code] || 0);
  const techMean = techMaturities.reduce((a, b) => a + b, 0) / techMaturities.length;
  const techVariance =
    techMaturities.reduce((sum, m) => sum + Math.pow(m - techMean, 2), 0) /
    techMaturities.length;
  const techStdDev = Math.sqrt(techVariance);

  const coherenceScore = techMean > 0 ? 1 - techStdDev / techMean : 1;
  const coherenceScoreClamped = Math.max(0, Math.min(1, coherenceScore));

  // Determinar status
  let status: 'coherent' | 'incoherent' | 'critical' = 'coherent';
  if (alerts.some((a) => a.type === 'critical')) {
    status = 'critical';
  } else if (alerts.some((a) => a.type === 'high')) {
    status = 'incoherent';
  } else if (coherenceScoreClamped < 0.7) {
    status = 'incoherent';
  }

  return {
    score: coherenceScoreClamped,
    status,
    alerts,
  };
}
