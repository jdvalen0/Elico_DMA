import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getEvaluations,
  getEvaluation,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
} from '../controllers/evaluations';
import { asyncHandler } from '../utils/asyncHandler';

export const evaluationRoutes = Router();

evaluationRoutes.use(authenticateToken);

evaluationRoutes.get('/', asyncHandler(getEvaluations));
evaluationRoutes.get('/:id', asyncHandler(getEvaluation));
evaluationRoutes.post('/', asyncHandler(createEvaluation));
evaluationRoutes.patch('/:id', asyncHandler(updateEvaluation));
evaluationRoutes.delete('/:id', asyncHandler(deleteEvaluation));
