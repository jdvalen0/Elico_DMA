import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getEvaluations,
  getEvaluation,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
} from '../controllers/evaluations';

export const evaluationRoutes = Router();

evaluationRoutes.use(authenticateToken);

evaluationRoutes.get('/', getEvaluations);
evaluationRoutes.get('/:id', getEvaluation);
evaluationRoutes.post('/', createEvaluation);
evaluationRoutes.patch('/:id', updateEvaluation);
evaluationRoutes.delete('/:id', deleteEvaluation);
