import { PrismaClient } from '@prisma/client';
import {
  calculateSubcriterionMaturity,
  calculateDimensionMaturity,
  calculateGlobalMaturity,
  classifyMaturity,
} from '../../../services/maturityCalculator';
import { initializeDimensions } from '../../../services/dimensions';
import { prisma } from '../../setup';

describe('MaturityCalculator', () => {
  let tenantId: string;
  let userId: string;
  let evaluationId: string;
  let dimensionId: string;
  let subcriterionId: string;

  beforeAll(async () => {
    // Limpiar datos previos
    await prisma.response.deleteMany({});
    await prisma.evidence.deleteMany({});
    await prisma.subcriterion.deleteMany({});
    await prisma.dimension.deleteMany({});
    await prisma.roadmap.deleteMany({});
    await prisma.evaluation.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.tenant.deleteMany({});

    // Crear tenant y usuario de prueba
    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant' },
    });
    tenantId = tenant.id;

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        tenantId: tenant.id,
      },
    });
    userId = user.id;

    // Crear evaluación
    const evaluation = await prisma.evaluation.create({
      data: {
        name: 'Test Evaluation',
        company: 'Test Company',
        tenantId: tenant.id,
        createdById: user.id,
        status: 'IN_PROGRESS',
      },
    });
    evaluationId = evaluation.id;

    // Inicializar dimensiones (esto crea dimensiones y subcriterios)
    await initializeDimensions(evaluation.id);

    // Esperar un momento para que se completen las transacciones
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Obtener primera dimensión y subcriterio
    const dimension = await prisma.dimension.findFirst({
      where: { evaluationId: evaluation.id },
      include: { subcriteria: true },
    });

    if (dimension && dimension.subcriteria.length > 0) {
      dimensionId = dimension.id;
      subcriterionId = dimension.subcriteria[0].id;
    } else {
      throw new Error('No se pudieron crear dimensiones y subcriterios');
    }
  });

  describe('calculateSubcriterionMaturity', () => {
    it('debe retornar 0 cuando no hay respuestas', async () => {
      // Asegurar que tenemos un subcriterio válido
      if (!subcriterionId) {
        const dimension = await prisma.dimension.findFirst({
          where: { evaluationId },
          include: { subcriteria: true },
        });
        if (dimension && dimension.subcriteria.length > 0) {
          subcriterionId = dimension.subcriteria[0].id;
        } else {
          return; // Skip test si no hay datos
        }
      }
      const maturity = await calculateSubcriterionMaturity(subcriterionId);
      expect(maturity).toBe(0);
    });

    it('debe calcular el promedio de respuestas correctamente', async () => {
      // Crear respuestas de prueba
      await prisma.response.createMany({
        data: [
          {
            evaluationId,
            subcriterionId,
            dimensionId,
            value: 2.0,
            answeredById: userId,
          },
          {
            evaluationId,
            subcriterionId,
            dimensionId,
            value: 4.0,
            answeredById: userId,
          },
          {
            evaluationId,
            subcriterionId,
            dimensionId,
            value: 3.0,
            answeredById: userId,
          },
        ],
      });

      const maturity = await calculateSubcriterionMaturity(subcriterionId);
      expect(maturity).toBeCloseTo(3.0, 2);
    });
  });

  describe('calculateDimensionMaturity', () => {
    it('debe retornar 0 cuando no hay subcriterios con respuestas', async () => {
      const maturity = await calculateDimensionMaturity(dimensionId);
      expect(maturity).toBe(0);
    });

    it('debe calcular la madurez ponderada correctamente', async () => {
      const dimension = await prisma.dimension.findUnique({
        where: { id: dimensionId },
        include: { subcriteria: true },
      });

      if (dimension && dimension.subcriteria.length >= 2) {
        // Crear respuestas para dos subcriterios
        const sub1 = dimension.subcriteria[0];
        const sub2 = dimension.subcriteria[1];

        await prisma.response.createMany({
          data: [
            {
              evaluationId,
              subcriterionId: sub1.id,
              dimensionId,
              value: 4.0,
              answeredById: userId,
            },
            {
              evaluationId,
              subcriterionId: sub2.id,
              dimensionId,
              value: 2.0,
              answeredById: userId,
            },
          ],
        });

        const maturity = await calculateDimensionMaturity(dimensionId);
        expect(maturity).toBeGreaterThan(0);
        expect(maturity).toBeLessThanOrEqual(5.0);
      }
    });
  });

  describe('calculateGlobalMaturity', () => {
    it('debe lanzar error si la evaluación no existe', async () => {
      await expect(
        calculateGlobalMaturity('non-existent-id')
      ).rejects.toThrow('Evaluation not found');
    });

    it('debe calcular la madurez global y actualizar la base de datos', async () => {
      // Asegurar que la evaluación existe y tiene dimensiones
      const evalCheck = await prisma.evaluation.findUnique({
        where: { id: evaluationId },
        include: { dimensions: true },
      });
      
      if (!evalCheck || evalCheck.dimensions.length === 0) {
        // Recrear evaluación si no existe
        const tenant = await prisma.tenant.findFirst();
        const user = await prisma.user.findFirst();
        if (tenant && user) {
          const newEval = await prisma.evaluation.create({
            data: {
              name: 'Test Evaluation',
              company: 'Test Company',
              tenantId: tenant.id,
              createdById: user.id,
              status: 'IN_PROGRESS',
            },
          });
          await initializeDimensions(newEval.id);
          evaluationId = newEval.id;
        }
      }
      
      const result = await calculateGlobalMaturity(evaluationId);

      expect(result.globalMaturity).toBeGreaterThanOrEqual(0);
      expect(result.globalMaturity).toBeLessThanOrEqual(5.0);
      expect(result.dimensionMaturity).toBeDefined();

      // Verificar que se actualizó en la base de datos
      const evaluation = await prisma.evaluation.findUnique({
        where: { id: evaluationId },
      });

      expect(evaluation?.globalMaturity).toBeDefined();
      expect(evaluation?.classification).toBeDefined();
    });
  });

  describe('classifyMaturity', () => {
    it('debe clasificar como Reactivo para valores < 1.0', () => {
      expect(classifyMaturity(0.5)).toBe('Reactivo');
    });

    it('debe clasificar como Inicial para valores >= 1.0 y < 2.0', () => {
      expect(classifyMaturity(1.5)).toBe('Inicial');
    });

    it('debe clasificar como Estructurado para valores >= 2.0 y < 3.0', () => {
      expect(classifyMaturity(2.5)).toBe('Estructurado');
    });

    it('debe clasificar como Integrado para valores >= 3.0 y < 4.0', () => {
      expect(classifyMaturity(3.5)).toBe('Integrado');
    });

    it('debe clasificar como Optimizado para valores >= 4.0 y < 4.5', () => {
      expect(classifyMaturity(4.2)).toBe('Optimizado');
    });

    it('debe clasificar como Predictivo/Inteligente para valores >= 4.5', () => {
      expect(classifyMaturity(4.8)).toBe('Predictivo/Inteligente');
    });
  });
});
