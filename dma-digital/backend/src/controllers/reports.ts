import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generatePDFReport } from '../services/pdfGenerator';

const prisma = new PrismaClient();

// Simulación de jobs (en producción usar Redis o queue system)
const reportJobs = new Map<string, any>();

export const generateReport = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { type, options } = req.body;

  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id,
      tenantId: req.user!.tenantId,
    },
    include: {
      dimensions: {
        include: {
          subcriteria: true,
        },
        orderBy: {
          code: 'asc',
        },
      },
    },
  });

  if (!evaluation) {
    throw new AppError(404, 'Evaluation not found', 'NOT_FOUND');
  }

  // Obtener todas las respuestas con notas para el reporte
  const responses = await prisma.response.findMany({
    where: {
      evaluationId: id,
    },
    include: {
      subcriterion: {
        select: {
          id: true,
          code: true,
          name: true,
          dimensionId: true,
        },
      },
      answeredBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Iniciar generación en background
  reportJobs.set(jobId, {
    status: 'processing',
    progress: 0,
  });

  generatePDFReport(evaluation, responses, type || 'executive', options || {})
    .then((pdfBuffer) => {
      reportJobs.set(jobId, {
        status: 'completed',
        progress: 100,
        downloadUrl: `/api/reports/${jobId}/download`,
        pdfBuffer,
      });
    })
    .catch((error) => {
      reportJobs.set(jobId, {
        status: 'failed',
        progress: 0,
        error: error.message,
      });
    });

  res.status(202).json({
    jobId,
    status: 'processing',
    estimatedTime: 30, // segundos
  });
};

export const getReportStatus = async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;

  const job = reportJobs.get(jobId);

  if (!job) {
    throw new AppError(404, 'Job not found', 'NOT_FOUND');
  }

  res.json(job);
};

export const downloadReport = async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;

  const job = reportJobs.get(jobId);

  if (!job || job.status !== 'completed') {
    throw new AppError(404, 'Report not ready', 'NOT_FOUND');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="reporte-${jobId}.pdf"`
  );
  res.send(job.pdfBuffer);
};
