import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getEconomicConfig,
  upsertEconomicConfig,
  deleteEconomicConfig,
} from '../controllers/economicConfig';

export const economicConfigRoutes = Router();

economicConfigRoutes.use(authenticateToken);

economicConfigRoutes.get('/', getEconomicConfig);
economicConfigRoutes.post('/', upsertEconomicConfig);
economicConfigRoutes.put('/:id', upsertEconomicConfig);
economicConfigRoutes.delete('/:id', deleteEconomicConfig);
