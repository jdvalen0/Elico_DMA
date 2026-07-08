import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { generateRoadmap, getRoadmap } from '../controllers/roadmap';
import { asyncHandler } from '../utils/asyncHandler';

export const roadmapRoutes = Router();

roadmapRoutes.use(authenticateToken);

roadmapRoutes.post('/evaluations/:id/roadmap/generate', asyncHandler(generateRoadmap));
roadmapRoutes.get('/evaluations/:id/roadmap', asyncHandler(getRoadmap));
