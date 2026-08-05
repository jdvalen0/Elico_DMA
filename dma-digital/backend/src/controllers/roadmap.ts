import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateRoadmapService } from '../services/roadmapGenerator';

const prisma = new PrismaClient();

export const generateRoadmap = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { targetMaturity, timeframe, budget, companySize, priorities } = req.body;

  if (companySize && !['small', 'medium', 'large'].includes(companySize)) {
    throw new AppError(400, 'companySize must be small, medium or large', 'VALIDATION_ERROR');
  }

  if (budget !== undefined && budget !== null && (typeof budget !== 'number' || budget < 0)) {
    throw new AppError(400, 'budget must be a positive number', 'VALIDATION_ERROR');
  }

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
      companySize: companySize || 'medium',
      priorities: priorities || [],
    },
    req.user!.tenantId
  );

  // Guardar roadmap (incluyendo parámetros de generación)
  await prisma.roadmap.upsert({
    where: { evaluationId: id },
    create: {
      evaluationId: id,
      phases: roadmap.phases as any,
      totalROI: roadmap.totalROI,
      totalInvestment: roadmap.totalInvestment,
      totalAnnualValue: roadmap.totalAnnualValue,
      parameters: roadmap.parameters as any,
      excludedByBudget: roadmap.excludedByBudget,
    },
    update: {
      phases: roadmap.phases as any,
      totalROI: roadmap.totalROI,
      totalInvestment: roadmap.totalInvestment,
      totalAnnualValue: roadmap.totalAnnualValue,
      parameters: roadmap.parameters as any,
      excludedByBudget: roadmap.excludedByBudget,
    },
  });

  // Incluir currency y metadatos de generación en la respuesta
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
