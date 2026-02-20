import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import { initializeDimensions } from '../services/dimensions';

const prisma = new PrismaClient();

const createEvaluationSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  sector: z.string().optional(),
  startDate: z.string().optional(),
});

export const getEvaluations = async (req: AuthRequest, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const where: any = {
    tenantId: req.user!.tenantId,
  };

  if (status) {
    where.status = status;
  }

  const [evaluations, total] = await Promise.all([
    prisma.evaluation.findMany({
      where,
      skip,
      take: parseInt(limit as string),
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    prisma.evaluation.count({ where }),
  ]);

  res.json({
    data: evaluations,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages: Math.ceil(total / parseInt(limit as string)),
    },
  });
};

export const getEvaluation = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id,
      tenantId: req.user!.tenantId,
    },
    include: {
      dimensions: {
        include: {
          subcriteria: {
            orderBy: {
              code: 'asc', // Subcriterios ordenados alfabéticamente (D1.1, D1.2, etc.)
            },
          },
        },
        // Ordenar dimensiones numéricamente (D1, D2, ..., D12) no alfabéticamente
        // Usar raw query o ordenar después, ya que Prisma no soporta ordenamiento numérico directo
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          responses: true,
          evidence: true,
        },
      },
    },
  });

  if (!evaluation) {
    throw new AppError(404, 'Evaluation not found', 'NOT_FOUND');
  }

  // Ordenar dimensiones numéricamente (D1, D2, ..., D12) en lugar de alfabéticamente
  // Función para extraer el número del código (D1 -> 1, D12 -> 12)
  const extractDimensionNumber = (code: string): number => {
    const match = code.match(/^D(\d+)$/);
    return match ? parseInt(match[1], 10) : 999; // Si no coincide, poner al final
  };

  // Ordenar dimensiones numéricamente
  evaluation.dimensions.sort((a, b) => {
    const numA = extractDimensionNumber(a.code);
    const numB = extractDimensionNumber(b.code);
    return numA - numB;
  });

  // Ordenar subcriterios dentro de cada dimensión numéricamente
  evaluation.dimensions.forEach((dim) => {
    dim.subcriteria.sort((a, b) => {
      // Extraer números de códigos como D1.1, D1.2, etc.
      const matchA = a.code.match(/^D\d+\.(\d+)$/);
      const matchB = b.code.match(/^D\d+\.(\d+)$/);
      const numA = matchA ? parseInt(matchA[1], 10) : 999;
      const numB = matchB ? parseInt(matchB[1], 10) : 999;
      return numA - numB;
    });
  });

  res.json(evaluation);
};

export const createEvaluation = async (req: AuthRequest, res: Response) => {
  const data = createEvaluationSchema.parse(req.body);

  const evaluation = await prisma.evaluation.create({
    data: {
      name: data.name,
      company: data.company,
      sector: data.sector,
      tenantId: req.user!.tenantId,
      createdById: req.user!.id,
      status: 'DRAFT',
    },
  });

  // Initialize dimensions
  await initializeDimensions(evaluation.id);

  const evaluationWithDimensions = await prisma.evaluation.findUnique({
    where: { id: evaluation.id },
    include: {
      dimensions: {
        include: {
          subcriteria: true,
        },
      },
    },
  });

  res.status(201).json(evaluationWithDimensions);
};

export const updateEvaluation = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id,
      tenantId: req.user!.tenantId,
    },
  });

  if (!evaluation) {
    throw new AppError(404, 'Evaluation not found', 'NOT_FOUND');
  }

  const updated = await prisma.evaluation.update({
    where: { id },
    data: updateData,
  });

  res.json(updated);
};

export const deleteEvaluation = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id,
      tenantId: req.user!.tenantId,
    },
  });

  if (!evaluation) {
    throw new AppError(404, 'Evaluation not found', 'NOT_FOUND');
  }

  await prisma.evaluation.delete({
    where: { id },
  });

  res.status(204).send();
};
