import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { generateRoadmap, getRoadmap } from '../controllers/roadmap';

export const roadmapRoutes = Router();

roadmapRoutes.use(authenticateToken);

roadmapRoutes.post('/evaluations/:id/roadmap/generate', generateRoadmap);
roadmapRoutes.get('/evaluations/:id/roadmap', getRoadmap);
