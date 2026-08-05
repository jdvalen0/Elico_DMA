import request from 'supertest';
import express from 'express';
import { evaluationRoutes } from '../../routes/evaluations';
import { authenticateToken } from '../../middleware/auth';
import { errorHandler } from '../../middleware/errorHandler';
import { createTestUser, generateAuthToken, createTestEvaluation } from '../helpers/testHelpers';
import { initializeDimensions } from '../../services/dimensions';
import { prisma } from '../setup';

const app = express();
app.use(express.json());
app.use('/api/evaluations', authenticateToken, evaluationRoutes);
app.use(errorHandler);

describe('Evaluations API', () => {
  let testUser: any;
  let testTenant: any;
  let authToken: string;

  beforeAll(async () => {
    const result = await createTestUser('eval-test@example.com');
    testUser = result.user;
    testTenant = result.tenant;
    authToken = generateAuthToken(testUser);
  });

  describe('GET /api/evaluations', () => {
    it('debe listar evaluaciones del tenant', async () => {
      // Crear algunas evaluaciones
      await createTestEvaluation(testUser.id, testTenant.id);
      await createTestEvaluation(testUser.id, testTenant.id);

      const response = await request(app)
        .get('/api/evaluations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('debe filtrar por status', async () => {
      const response = await request(app)
        .get('/api/evaluations?status=DRAFT')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach((evaluation: any) => {
        expect(evaluation.status).toBe('DRAFT');
      });
    });

    it('debe paginar resultados', async () => {
      const response = await request(app)
        .get('/api/evaluations?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('debe requerir autenticación', async () => {
      const response = await request(app).get('/api/evaluations');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/evaluations/:id', () => {
    it('debe obtener evaluación por ID', async () => {
      const evaluation = await createTestEvaluation(testUser.id, testTenant.id);
      await initializeDimensions(evaluation.id);

      const response = await request(app)
        .get(`/api/evaluations/${evaluation.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(evaluation.id);
      expect(response.body).toHaveProperty('dimensions');
      expect(Array.isArray(response.body.dimensions)).toBe(true);
    });

    it('debe retornar 404 si la evaluación no existe', async () => {
      const response = await request(app)
        .get('/api/evaluations/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('no debe permitir acceder a evaluaciones de otros tenants', async () => {
      // Crear otro usuario y tenant
      const otherUser = await createTestUser('other@example.com');
      const otherEvaluation = await createTestEvaluation(
        otherUser.user.id,
        otherUser.tenant.id
      );

      const response = await request(app)
        .get(`/api/evaluations/${otherEvaluation.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/evaluations', () => {
    it('debe crear nueva evaluación', async () => {
      const response = await request(app)
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Nueva Evaluación',
          company: 'Nueva Empresa',
          sector: 'Manufactura',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Nueva Evaluación');
      expect(response.body.company).toBe('Nueva Empresa');
      expect(response.body.status).toBe('DRAFT');
      expect(response.body).toHaveProperty('dimensions');
      expect(response.body.dimensions.length).toBeGreaterThan(0);
    });

    it('debe validar campos requeridos', async () => {
      const response = await request(app)
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          company: 'Empresa sin nombre',
        });

      expect(response.status).toBe(400);
    });

    it('debe inicializar dimensiones automáticamente', async () => {
      const response = await request(app)
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Evaluación con Dimensiones',
          company: 'Empresa Test',
        });

      expect(response.status).toBe(201);
      expect(response.body.dimensions.length).toBe(12); // 12 dimensiones
    });
  });

  describe('PATCH /api/evaluations/:id', () => {
    it('debe actualizar evaluación', async () => {
      const evaluation = await createTestEvaluation(testUser.id, testTenant.id);

      const response = await request(app)
        .patch(`/api/evaluations/${evaluation.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Evaluación Actualizada',
          status: 'IN_PROGRESS',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Evaluación Actualizada');
      expect(response.body.status).toBe('IN_PROGRESS');
    });

    it('debe retornar 404 si la evaluación no existe', async () => {
      const response = await request(app)
        .patch('/api/evaluations/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Actualización',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/evaluations/:id', () => {
    it('debe eliminar evaluación', async () => {
      const evaluation = await createTestEvaluation(testUser.id, testTenant.id);

      const response = await request(app)
        .delete(`/api/evaluations/${evaluation.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verificar que fue eliminada
      const deleted = await prisma.evaluation.findUnique({
        where: { id: evaluation.id },
      });
      expect(deleted).toBeNull();
    });

    it('debe retornar 404 si la evaluación no existe', async () => {
      const response = await request(app)
        .delete('/api/evaluations/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
