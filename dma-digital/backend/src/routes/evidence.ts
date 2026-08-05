import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  uploadEvidence,
  getEvidence,
  deleteEvidence,
} from '../controllers/evidence';
import multer from 'multer';
import { asyncHandler } from '../utils/asyncHandler';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo por evidencia
});

export const evidenceRoutes = Router();

evidenceRoutes.use(authenticateToken);

evidenceRoutes.post(
  '/evaluations/:evaluationId/evidence',
  upload.single('file'),
  asyncHandler(uploadEvidence)
);
evidenceRoutes.get('/evaluations/:evaluationId/evidence', asyncHandler(getEvidence));
evidenceRoutes.delete('/:id', asyncHandler(deleteEvidence));
