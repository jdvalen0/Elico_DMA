import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { calculateGlobalMaturity } from '../services/maturityCalculator';

const prisma = new PrismaClient();

const responseSchema = z.object({
  dimensionId: z.string().uuid().optional(),
  subcriterionId: z.string().uuid(),
  value: z.number().min(0).max(5),
  notes: z.string().optional(),
  evidenceIds: z.array(z.string().uuid()).optional(),
});

export const getResponses = async (req: AuthRequest, res: Response) => {
  const { evaluationId } = req.params;
  const { dimensionId, subcriterionId } = req.query;

  const where: any = {
    evaluationId,
  };

  if (dimensionId) {
    where.dimensionId = dimensionId;
  }

  if (subcriterionId) {
    where.subcriterionId = subcriterionId;
  }

  const responses = await prisma.response.findMany({
    where,
    include: {
      answeredBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      subcriterion: {
        select: {
          code: true,
          name: true,
        },
      },
      evidence: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  res.json({ data: responses });
};

export const createOrUpdateResponse = async (
  req: AuthRequest,
  res: Response
) => {
  const { evaluationId } = req.params;
  const data = responseSchema.parse(req.body);

  // Verificar que la evaluación pertenece al tenant
  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id: evaluationId,
      tenantId: req.user!.tenantId,
    },
  });

  if (!evaluation) {
    throw new AppError(404, 'Evaluation not found', 'NOT_FOUND');
  }

  // Buscar respuesta existente
  const existingResponse = await prisma.response.findFirst({
    where: {
      evaluationId,
      subcriterionId: data.subcriterionId,
      answeredById: req.user!.id,
    },
  });

  let response;

  if (existingResponse) {
    // Actualizar respuesta existente
    response = await prisma.response.update({
      where: { id: existingResponse.id },
      data: {
        value: data.value,
        notes: data.notes,
        dimensionId: data.dimensionId,
      },
      include: {
        answeredBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } else {
    // Crear nueva respuesta
    response = await prisma.response.create({
      data: {
        evaluationId,
        dimensionId: data.dimensionId,
        subcriterionId: data.subcriterionId,
        value: data.value,
        notes: data.notes,
        answeredById: req.user!.id,
      },
      include: {
        answeredBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Actualizar estado a IN_PROGRESS si está en DRAFT
  if (evaluation.status === 'DRAFT') {
    await prisma.evaluation.update({
      where: { id: evaluationId },
      data: { status: 'IN_PROGRESS' },
    });
  }

  // Recalcular madurez en background (opcional, puede ser async)
  calculateGlobalMaturity(evaluationId).catch(console.error);

  res.json(response);
};
