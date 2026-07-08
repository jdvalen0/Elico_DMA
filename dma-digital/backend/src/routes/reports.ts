import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { generateReport, getReportStatus, downloadReport } from '../controllers/reports';
import { asyncHandler } from '../utils/asyncHandler';

export const reportRoutes = Router();

reportRoutes.use(authenticateToken);

reportRoutes.post('/evaluations/:id/reports/generate', asyncHandler(generateReport));
reportRoutes.get('/:jobId/status', asyncHandler(getReportStatus));
reportRoutes.get('/:jobId/download', asyncHandler(downloadReport));
