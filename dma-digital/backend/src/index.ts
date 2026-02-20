import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { evaluationRoutes } from './routes/evaluations';
import { responseRoutes } from './routes/responses';
import { evidenceRoutes } from './routes/evidence';
import { maturityRoutes } from './routes/maturity';
import { roadmapRoutes } from './routes/roadmap';
import { reportRoutes } from './routes/reports';
import { benchmarkRoutes } from './routes/benchmark';
import { economicConfigRoutes } from './routes/economicConfig';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/maturity', maturityRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/benchmark', benchmarkRoutes);
app.use('/api/economic-config', economicConfigRoutes);

// Error handling
app.use(errorHandler);

// Manejo de errores no capturados para evitar que el servidor se detenga
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  // No detener el servidor, solo registrar el error
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // No detener el servidor, solo registrar el error
});

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');
  process.exit(0);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
});

// Manejo de errores del servidor
server.on('error', (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`❌ Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});
