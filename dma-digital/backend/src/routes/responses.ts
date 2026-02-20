import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getResponses, createOrUpdateResponse } from '../controllers/responses';

export const responseRoutes = Router();

responseRoutes.use(authenticateToken);

responseRoutes.get('/evaluations/:evaluationId/responses', getResponses);
responseRoutes.put('/evaluations/:evaluationId/responses', createOrUpdateResponse);
