import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getBenchmark = async (req: AuthRequest, res: Response) => {
  const { sector } = req.params;
  const { dimension } = req.query;

  const where: any = {
    sector,
    anonymized: true,
  };

  if (dimension) {
    where.dimensionCode = dimension;
  }

  const data = await prisma.benchmarkData.findMany({
    where,
    orderBy: {
      evaluationDate: 'desc',
    },
    take: 1000, // Últimos 1000 registros
  });

  if (data.length === 0) {
    return res.json({
      sector,
      dimension: dimension || 'global',
      statistics: {
        mean: 0,
        median: 0,
        stdDev: 0,
        sampleSize: 0,
      },
    });
  }

  const maturities = data.map((d) => d.maturity);
  const mean = maturities.reduce((a, b) => a + b, 0) / maturities.length;
  const sorted = [...maturities].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  const variance =
    maturities.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) /
    maturities.length;
  const stdDev = Math.sqrt(variance);

  res.json({
    sector,
    dimension: dimension || 'global',
    statistics: {
      mean,
      median,
      stdDev,
      sampleSize: data.length,
      percentiles: {
        p25: sorted[Math.floor(sorted.length * 0.25)],
        p50: median,
        p75: sorted[Math.floor(sorted.length * 0.75)],
        p90: sorted[Math.floor(sorted.length * 0.9)],
      },
    },
  });
};

export const compareWithBenchmark = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

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

  const sector = evaluation.sector || 'manufacturing';

  // Obtener benchmark del sector
  const benchmarkData = await prisma.benchmarkData.findMany({
    where: {
      sector,
      anonymized: true,
    },
    take: 1000,
  });

  const sectorMean =
    benchmarkData.length > 0
      ? benchmarkData.reduce((sum, d) => sum + d.maturity, 0) /
        benchmarkData.length
      : 2.5; // Default

  const evaluationMaturity = evaluation.globalMaturity || 0;
  const percentile =
    benchmarkData.length > 0
      ? (benchmarkData.filter((d) => d.maturity < evaluationMaturity).length /
          benchmarkData.length) *
        100
      : 50;

  res.json({
    global: {
      evaluationMaturity,
      sectorMean,
      percentile,
      position:
        evaluationMaturity > sectorMean ? 'above_average' : 'below_average',
    },
    dimensions: evaluation.dimensions.map((dim) => ({
      code: dim.code,
      evaluationMaturity: dim.maturity || 0,
      // En producción, calcular benchmark por dimensión
    })),
  });
};
