import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getBenchmark, compareWithBenchmark } from '../controllers/benchmark';

export const benchmarkRoutes = Router();

benchmarkRoutes.use(authenticateToken);

benchmarkRoutes.get('/sector/:sector', getBenchmark);
benchmarkRoutes.post('/evaluations/:id/compare', compareWithBenchmark);
