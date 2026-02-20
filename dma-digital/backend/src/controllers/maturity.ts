import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { calculateGlobalMaturity } from '../services/maturityCalculator';
import { validateCoherence } from '../services/coherenceValidator';

export const calculateMaturity = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Verificar que la evaluación pertenece al tenant
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id,
      tenantId: req.user!.tenantId,
    },
  });

  if (!evaluation) {
    throw new AppError(404, 'Evaluation not found', 'NOT_FOUND');
  }

  // Calcular madurez
  const { globalMaturity, dimensionMaturity } = await calculateGlobalMaturity(
    id
  );

  // Validar coherencia
  const coherence = await validateCoherence(id, dimensionMaturity);

  res.json({
    globalMaturity,
    classification: classifyMaturity(globalMaturity),
    dimensionMaturity,
    coherence,
    calculatedAt: new Date().toISOString(),
  });
};

function classifyMaturity(maturity: number): string {
  if (maturity < 1.0) return 'Reactivo';
  if (maturity < 2.0) return 'Inicial';
  if (maturity < 3.0) return 'Estructurado';
  if (maturity < 4.0) return 'Integrado';
  if (maturity < 4.5) return 'Optimizado';
  return 'Predictivo/Inteligente';
}
