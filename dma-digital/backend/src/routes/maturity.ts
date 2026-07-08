import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { calculateMaturity } from '../controllers/maturity';
import { asyncHandler } from '../utils/asyncHandler';

export const maturityRoutes = Router();

maturityRoutes.use(authenticateToken);

maturityRoutes.post('/evaluations/:id/calculate', asyncHandler(calculateMaturity));
