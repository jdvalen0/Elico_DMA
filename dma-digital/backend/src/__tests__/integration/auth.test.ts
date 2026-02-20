import request from 'supertest';
import express from 'express';
import { authRoutes } from '../../../routes/auth';
import { errorHandler } from '../../../middleware/errorHandler';
import { authenticateToken } from '../../../middleware/auth';
import { createTestUser } from '../helpers/testHelpers';
import { prisma } from '../setup';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Auth API', () => {
  let testUser: any;

  beforeAll(async () => {
    const result = await createTestUser('auth-test@example.com');
    testUser = result.user;
  });

  describe('POST /api/auth/login', () => {
    it('debe hacer login exitoso con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth-test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('auth-test@example.com');
    });

    it('debe fallar con credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth-test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('debe fallar con email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
    });

    it('debe validar formato de email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('debe validar longitud mínima de contraseña', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth-test@example.com',
          password: '12345',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('debe refrescar token válido', async () => {
      // Primero hacer login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'auth-test@example.com',
          password: 'password123',
        });

      const { refreshToken } = loginResponse.body;

      // Refrescar token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body).toHaveProperty('accessToken');
    });

    it('debe fallar con refresh token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(403);
    });

    it('debe requerir refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('debe hacer logout exitoso', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
});
