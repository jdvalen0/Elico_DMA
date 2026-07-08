import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getResponses, createOrUpdateResponse } from '../controllers/responses';
import { asyncHandler } from '../utils/asyncHandler';

export const responseRoutes = Router();

responseRoutes.use(authenticateToken);

responseRoutes.get('/evaluations/:evaluationId/responses', asyncHandler(getResponses));
responseRoutes.put('/evaluations/:evaluationId/responses', asyncHandler(createOrUpdateResponse));
