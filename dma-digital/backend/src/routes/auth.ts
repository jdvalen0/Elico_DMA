import { Router } from 'express';
import { login, refreshToken, logout, getCurrentUser } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

export const authRoutes = Router();

authRoutes.post('/login', asyncHandler(login));
authRoutes.post('/refresh', asyncHandler(refreshToken));
authRoutes.post('/logout', asyncHandler(logout));
authRoutes.get('/me', authenticateToken, asyncHandler(getCurrentUser));