import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Calcula la madurez de un subcriterio basado en las respuestas
 */
export async function calculateSubcriterionMaturity(
  subcriterionId: string
): Promise<number> {
  const responses = await prisma.response.findMany({
    where: { subcriterionId },
  });

  if (responses.length === 0) {
    return 0;
  }

  const sum = responses.reduce((acc, r) => acc + r.value, 0);
  return sum / responses.length;
}

/**
 * Calcula la madurez de una dimensión basado en sus subcriterios
 */
export async function calculateDimensionMaturity(
  dimensionId: string
): Promise<number> {
  const dimension = await prisma.dimension.findUnique({
    where: { id: dimensionId },
    include: {
      subcriteria: {
        include: {
          responses: true,
        },
      },
    },
  });

  if (!dimension) {
    return 0;
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const subcriterion of dimension.subcriteria) {
    const subcriterionMaturity = await calculateSubcriterionMaturity(
      subcriterion.id
    );

    weightedSum += subcriterionMaturity * subcriterion.weight;
    totalWeight += subcriterion.weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Calcula la madurez global de una evaluación
 */
export async function calculateGlobalMaturity(
  evaluationId: string
): Promise<{ globalMaturity: number; dimensionMaturity: Record<string, number> }> {
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: evaluationId },
    include: {
      dimensions: {
        include: {
          subcriteria: {
            include: {
              responses: true,
            },
          },
        },
      },
    },
  });

  if (!evaluation) {
    throw new Error('Evaluation not found');
  }

  const dimensionMaturity: Record<string, number> = {};
  let globalMaturity = 0;

  for (const dimension of evaluation.dimensions) {
    const maturity = await calculateDimensionMaturity(dimension.id);
    dimensionMaturity[dimension.code] = maturity;
    globalMaturity += maturity * dimension.weight;
  }

  // Actualizar madurez en base de datos
  // Si está en DRAFT, cambiar a IN_PROGRESS (primera vez que se calcula)
  const updateData: any = {
    globalMaturity,
    classification: classifyMaturity(globalMaturity),
  };
  
  if (evaluation.status === 'DRAFT') {
    updateData.status = 'IN_PROGRESS';
  }

  await prisma.evaluation.update({
    where: { id: evaluationId },
    data: updateData,
  });

  // Actualizar madurez de dimensiones
  for (const dimension of evaluation.dimensions) {
    await prisma.dimension.update({
      where: { id: dimension.id },
      data: {
        maturity: dimensionMaturity[dimension.code],
      },
    });
  }

  return { globalMaturity, dimensionMaturity };
}

/**
 * Clasifica el nivel de madurez
 */
export function classifyMaturity(maturity: number): string {
  if (maturity < 1.0) return 'Reactivo';
  if (maturity < 2.0) return 'Inicial';
  if (maturity < 3.0) return 'Estructurado';
  if (maturity < 4.0) return 'Integrado';
  if (maturity < 4.5) return 'Optimizado';
  return 'Predictivo/Inteligente';
}
