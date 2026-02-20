import { Router } from 'express';
import { login, refreshToken, logout, getCurrentUser } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

export const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.post('/refresh', refreshToken);
authRoutes.post('/logout', logout);
authRoutes.get('/me', authenticateToken, getCurrentUser);