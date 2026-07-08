import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getEconomicConfig,
  upsertEconomicConfig,
  deleteEconomicConfig,
} from '../controllers/economicConfig';
import { asyncHandler } from '../utils/asyncHandler';

export const economicConfigRoutes = Router();

economicConfigRoutes.use(authenticateToken);

economicConfigRoutes.get('/', asyncHandler(getEconomicConfig));
economicConfigRoutes.post('/', asyncHandler(upsertEconomicConfig));
economicConfigRoutes.put('/:id', asyncHandler(upsertEconomicConfig));
economicConfigRoutes.delete('/:id', asyncHandler(deleteEconomicConfig));
