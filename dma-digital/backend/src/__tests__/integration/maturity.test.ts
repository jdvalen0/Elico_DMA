import request from 'supertest';
import express from 'express';
import { maturityRoutes } from '../../../routes/maturity';
import { authenticateToken } from '../../../middleware/auth';
import { errorHandler } from '../../../middleware/errorHandler';
import { createTestUser, generateAuthToken, createTestEvaluation } from '../helpers/testHelpers';
import { initializeDimensions } from '../../../services/dimensions';
import { prisma } from '../setup';

const app = express();
app.use(express.json());
app.use('/api/maturity', authenticateToken, maturityRoutes);
app.use(errorHandler);

describe('Maturity API', () => {
  let testUser: any;
  let testTenant: any;
  let authToken: string;
  let evaluationId: string;

  beforeAll(async () => {
    const result = await createTestUser('maturity-test@example.com');
    testUser = result.user;
    testTenant = result.tenant;
    authToken = generateAuthToken(testUser);

    const evaluation = await createTestEvaluation(testUser.id, testTenant.id);
    evaluationId = evaluation.id;
    await initializeDimensions(evaluation.id);
  });

  describe('POST /api/maturity/calculate/:evaluationId', () => {
    it('debe calcular la madurez de una evaluación', async () => {
      // Crear algunas respuestas de prueba
      const dimension = await prisma.dimension.findFirst({
        where: { evaluationId },
        include: { subcriteria: true },
      });

      if (dimension && dimension.subcriteria.length > 0) {
        const subcriterion = dimension.subcriteria[0];

        await prisma.response.create({
          data: {
            evaluationId,
            dimensionId: dimension.id,
            subcriterionId: subcriterion.id,
            value: 3.0,
            answeredById: testUser.id,
          },
        });
      }

      const response = await request(app)
        .post(`/api/maturity/calculate/${evaluationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('globalMaturity');
      expect(response.body).toHaveProperty('dimensionMaturity');
      expect(typeof response.body.globalMaturity).toBe('number');
    });

    it('debe retornar 404 si la evaluación no existe', async () => {
      const response = await request(app)
        .post('/api/maturity/calculate/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('debe requerir autenticación', async () => {
      const response = await request(app)
        .post(`/api/maturity/calculate/${evaluationId}`);

      expect(response.status).toBe(401);
    });
  });
});
