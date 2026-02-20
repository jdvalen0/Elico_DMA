import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  uploadEvidence,
  getEvidence,
  deleteEvidence,
} from '../controllers/evidence';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export const evidenceRoutes = Router();

evidenceRoutes.use(authenticateToken);

evidenceRoutes.post(
  '/evaluations/:evaluationId/evidence',
  upload.single('file'),
  uploadEvidence
);
evidenceRoutes.get('/evaluations/:evaluationId/evidence', getEvidence);
evidenceRoutes.delete('/evidence/:id', deleteEvidence);
