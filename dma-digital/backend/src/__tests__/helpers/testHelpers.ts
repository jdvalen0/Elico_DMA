import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function createTestUser(email: string = 'test@example.com') {
  const tenant = await prisma.tenant.create({
    data: { name: `Test Tenant ${Date.now()}` },
  });

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Test User',
      tenantId: tenant.id,
    },
  });

  return { user, tenant };
}

export function generateAuthToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '15m' }
  );
}

export async function createTestEvaluation(userId: string, tenantId: string) {
  return await prisma.evaluation.create({
    data: {
      name: 'Test Evaluation',
      company: 'Test Company',
      tenantId,
      createdById: userId,
      status: 'DRAFT',
    },
  });
}
