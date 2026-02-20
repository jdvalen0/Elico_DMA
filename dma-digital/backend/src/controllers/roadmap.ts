import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateRoadmapService } from '../services/roadmapGenerator';

const prisma = new PrismaClient();

export const generateRoadmap = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { targetMaturity, timeframe, budget, priorities } = req.body;

  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id,
      tenantId: req.user!.tenantId,
    },
    include: {
      dimensions: true,
    },
  });

  if (!evaluation) {
    throw new AppError(404, 'Evaluation not found', 'NOT_FOUND');
  }

  // Verificar que la madurez esté calculada (puede ser 0, pero debe existir)
  if (evaluation.globalMaturity == null) {
    throw new AppError(400, 'Evaluation must be calculated first', 'VALIDATION_ERROR');
  }

  const roadmap = await generateRoadmapService(
    id,
    evaluation.globalMaturity,
    evaluation.dimensions,
    {
      targetMaturity: targetMaturity || 4.0,
      timeframe: timeframe || 24,
      budget: budget,
      priorities: priorities || [],
    },
    req.user!.tenantId
  );

  // Guardar roadmap (incluyendo currency en phases)
  await prisma.roadmap.upsert({
    where: { evaluationId: id },
    create: {
      evaluationId: id,
      phases: roadmap.phases as any,
      totalROI: roadmap.totalROI,
      totalInvestment: roadmap.totalInvestment,
      totalAnnualValue: roadmap.totalAnnualValue,
    },
    update: {
      phases: roadmap.phases as any,
      totalROI: roadmap.totalROI,
      totalInvestment: roadmap.totalInvestment,
      totalAnnualValue: roadmap.totalAnnualValue,
    },
  });

  // Incluir currency en la respuesta
  const roadmapResponse = {
    ...roadmap,
    currency: roadmap.currency,
  };

  res.json(roadmapResponse);
};

export const getRoadmap = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const roadmap = await prisma.roadmap.findUnique({
    where: { evaluationId: id },
    include: {
      evaluation: {
        select: {
          tenantId: true,
        },
      },
    },
  });

  if (!roadmap) {
    throw new AppError(404, 'Roadmap not found', 'NOT_FOUND');
  }

  if (roadmap.evaluation.tenantId !== req.user!.tenantId) {
    throw new AppError(403, 'Forbidden', 'FORBIDDEN');
  }

  res.json(roadmap);
};
