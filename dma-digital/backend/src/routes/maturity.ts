import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { calculateMaturity } from '../controllers/maturity';

export const maturityRoutes = Router();

maturityRoutes.use(authenticateToken);

maturityRoutes.post('/evaluations/:id/calculate', calculateMaturity);
