import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { MinioClient } from '../services/storage';

const prisma = new PrismaClient();
const minio = new MinioClient();

export const uploadEvidence = async (req: AuthRequest, res: Response) => {
  const { evaluationId } = req.params;
  const { type, description, subcriterionId } = req.body;
  const file = req.file;

  if (!file) {
    throw new AppError(400, 'File is required', 'VALIDATION_ERROR');
  }

  // Verificar evaluación
  const evaluation = await prisma.evaluation.findFirst({
    where: {
      id: evaluationId,
      tenantId: req.user!.tenantId,
    },
  });

  if (!evaluation) {
    throw new AppError(404, 'Evaluation not found', 'NOT_FOUND');
  }

  // Subir archivo a MinIO (o almacenar en base64 si MinIO no está disponible)
  const fileName = `${evaluationId}/${Date.now()}-${file.originalname}`;
  let filePath = fileName;
  
  try {
    await minio.uploadFile(fileName, file.buffer, file.mimetype);
  } catch (error: any) {
    // Si MinIO no está disponible, almacenar en base64 en la BD
    console.warn('⚠️  MinIO no disponible, almacenando archivo en base64:', error.message);
    filePath = `base64:${file.buffer.toString('base64')}`;
  }

  // Crear registro en base de datos
  const evidence = await prisma.evidence.create({
    data: {
      evaluationId,
      type: type || 'PHOTO',
      filePath: filePath,
      fileSize: BigInt(file.size),
      mimeType: file.mimetype,
      description,
      createdById: req.user!.id,
    },
  });

  res.status(201).json(evidence);
};

export const getEvidence = async (req: AuthRequest, res: Response) => {
  const { evaluationId } = req.params;
  const { type, page = '1', limit = '20' } = req.query;

  const where: any = {
    evaluationId,
  };

  if (type) {
    where.type = type;
  }

  const [evidence, total] = await Promise.all([
    prisma.evidence.findMany({
      where,
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
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
        createdAt: 'desc',
      },
    }),
    prisma.evidence.count({ where }),
  ]);

  // Generar URLs de acceso
  const evidenceWithUrls = await Promise.all(
    evidence.map(async (e) => {
      let url = '';
      if (e.filePath.startsWith('base64:')) {
        // Archivo almacenado en base64
        url = `data:${e.mimeType};base64,${e.filePath.substring(7)}`;
      } else {
        try {
          url = await minio.getFileUrl(e.filePath);
        } catch (error: any) {
          console.warn('⚠️  Error obteniendo URL de MinIO:', error.message);
          url = '';
        }
      }
      return { ...e, url };
    })
  );

  res.json({
    data: evidenceWithUrls,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
    },
  });
};

export const deleteEvidence = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const evidence = await prisma.evidence.findFirst({
    where: { id },
    include: {
      evaluation: true,
    },
  });

  if (!evidence) {
    throw new AppError(404, 'Evidence not found', 'NOT_FOUND');
  }

  if (evidence.evaluation.tenantId !== req.user!.tenantId) {
    throw new AppError(403, 'Forbidden', 'FORBIDDEN');
  }

  // Eliminar archivo de MinIO (si no es base64)
  if (!evidence.filePath.startsWith('base64:')) {
    try {
      await minio.deleteFile(evidence.filePath);
    } catch (error: any) {
      console.warn('⚠️  Error eliminando archivo de MinIO:', error.message);
    }
  }

  // Eliminar registro
  await prisma.evidence.delete({
    where: { id },
  });

  res.status(204).send();
};
