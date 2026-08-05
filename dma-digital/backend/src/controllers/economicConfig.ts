import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const prisma = new PrismaClient();

const economicConfigSchema = z.object({
  currency: z.string().min(1),
  costPerMonth: z.number().min(0),
  valuePerMaturityPoint: z.number().min(0),
  exchangeRate: z.number().min(0).nullish(),
  quickWinThreshold: z.number().min(0).max(1).optional(),
  maxQuickWinMonths: z.number().int().min(1).max(12).optional(),
  evaluationId: z.string().uuid().optional(),
});

// Obtener configuración económica (por tenant o evaluación)
export const getEconomicConfig = async (req: AuthRequest, res: Response) => {
  const { evaluationId } = req.query;

  let config;

  if (evaluationId) {
    // Verificar que la evaluación existe y pertenece al tenant
    const evaluation = await prisma.evaluation.findFirst({
      where: {
        id: evaluationId as string,
        tenantId: req.user!.tenantId,
      },
    });

    if (!evaluation) {
      throw new AppError(404, 'Evaluation not found', 'NOT_FOUND');
    }

    // Buscar configuración específica de evaluación
    config = await prisma.economicConfig.findFirst({
      where: {
        evaluationId: evaluationId as string,
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Si no hay configuración de evaluación, buscar por tenant
  if (!config) {
    config = await prisma.economicConfig.findFirst({
      where: {
        tenantId: req.user!.tenantId,
        evaluationId: null,
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Si no hay configuración, retornar valores por defecto
  if (!config) {
    return res.json({
      currency: 'USD',
      costPerMonth: 50000,
      valuePerMaturityPoint: 150000,
      exchangeRate: null,
      quickWinThreshold: 0.2,
      maxQuickWinMonths: 3,
      isDefault: true,
    });
  }

  res.json({
    ...config,
    isDefault: false,
  });
};

// Crear o actualizar configuración económica
export const upsertEconomicConfig = async (req: AuthRequest, res: Response) => {
  // Solo ADMIN o CONSULTANT pueden editar
  if (req.user!.role !== 'ADMIN' && req.user!.role !== 'CONSULTANT') {
    throw new AppError(403, 'Only ADMIN or CONSULTANT can edit economic configuration', 'FORBIDDEN');
  }

  const data = economicConfigSchema.parse(req.body);
  const { evaluationId } = data;

  // Si hay evaluationId, verificar que pertenece al tenant
  if (evaluationId) {
    const evaluation = await prisma.evaluation.findFirst({
      where: {
        id: evaluationId,
        tenantId: req.user!.tenantId,
      },
    });

    if (!evaluation) {
      throw new AppError(404, 'Evaluation not found', 'NOT_FOUND');
    }
  }

  // Buscar configuración existente
  const existing = await prisma.economicConfig.findFirst({
    where: evaluationId
      ? { evaluationId }
      : {
          tenantId: req.user!.tenantId,
          evaluationId: null,
        },
  });

  let config;

  if (existing) {
    // Actualizar
    config = await prisma.economicConfig.update({
      where: { id: existing.id },
      data: {
        currency: data.currency,
        costPerMonth: data.costPerMonth,
        valuePerMaturityPoint: data.valuePerMaturityPoint,
        exchangeRate: data.exchangeRate,
        quickWinThreshold: data.quickWinThreshold || 0.2,
        maxQuickWinMonths: data.maxQuickWinMonths || 3,
        updatedById: req.user!.id,
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  } else {
    // Crear
    config = await prisma.economicConfig.create({
      data: {
        tenantId: evaluationId ? null : req.user!.tenantId,
        evaluationId: evaluationId || null,
        currency: data.currency,
        costPerMonth: data.costPerMonth,
        valuePerMaturityPoint: data.valuePerMaturityPoint,
        exchangeRate: data.exchangeRate,
        quickWinThreshold: data.quickWinThreshold || 0.2,
        maxQuickWinMonths: data.maxQuickWinMonths || 3,
        updatedById: req.user!.id,
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  res.json(config);
};

// Eliminar configuración económica
export const deleteEconomicConfig = async (req: AuthRequest, res: Response) => {
  // Solo ADMIN o CONSULTANT pueden eliminar
  if (req.user!.role !== 'ADMIN' && req.user!.role !== 'CONSULTANT') {
    throw new AppError(403, 'Only ADMIN or CONSULTANT can delete economic configuration', 'FORBIDDEN');
  }

  const { id } = req.params;

  const config = await prisma.economicConfig.findFirst({
    where: { id },
    include: {
      tenant: true,
      evaluation: true,
    },
  });

  if (!config) {
    throw new AppError(404, 'Economic configuration not found', 'NOT_FOUND');
  }

  // Verificar permisos
  if (config.tenantId && config.tenantId !== req.user!.tenantId) {
    throw new AppError(403, 'Forbidden', 'FORBIDDEN');
  }

  if (config.evaluationId && config.evaluation?.tenantId !== req.user!.tenantId) {
    throw new AppError(403, 'Forbidden', 'FORBIDDEN');
  }

  await prisma.economicConfig.delete({
    where: { id },
  });

  res.status(204).send();
};
