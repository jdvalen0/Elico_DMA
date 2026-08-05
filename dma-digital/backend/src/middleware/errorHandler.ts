import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code || 'ERROR',
        message: err.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  if (err instanceof MulterError) {
    const isFileTooLarge = err.code === 'LIMIT_FILE_SIZE';
    return res.status(isFileTooLarge ? 413 : 400).json({
      error: {
        code: err.code,
        message: isFileTooLarge
          ? 'El archivo supera el tamaño máximo permitido (10MB)'
          : `Error al procesar el archivo: ${err.message}`,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  if (err instanceof ZodError) {
    const details = err.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join('; ');
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: `Datos inválidos: ${details}`,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
};
