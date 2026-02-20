import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { generateReport, getReportStatus, downloadReport } from '../controllers/reports';

export const reportRoutes = Router();

reportRoutes.use(authenticateToken);

reportRoutes.post('/evaluations/:id/reports/generate', generateReport);
reportRoutes.get('/:jobId/status', getReportStatus);
reportRoutes.get('/:jobId/download', downloadReport);
