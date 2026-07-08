import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getBenchmark, compareWithBenchmark } from '../controllers/benchmark';
import { asyncHandler } from '../utils/asyncHandler';

export const benchmarkRoutes = Router();

benchmarkRoutes.use(authenticateToken);

benchmarkRoutes.get('/sector/:sector', asyncHandler(getBenchmark));
benchmarkRoutes.post('/evaluations/:id/compare', asyncHandler(compareWithBenchmark));
