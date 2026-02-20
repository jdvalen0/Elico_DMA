import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Limpiar base de datos antes de cada suite de pruebas
beforeAll(async () => {
  // Conectar a la base de datos de pruebas
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// Limpiar datos de prueba después de cada test
afterEach(async () => {
  // Limpiar en orden inverso de dependencias
  await prisma.response.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.subcriterion.deleteMany({});
  await prisma.dimension.deleteMany({});
  await prisma.roadmap.deleteMany({});
  await prisma.evaluation.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.benchmarkData.deleteMany({});
});

export { prisma };
