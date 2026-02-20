import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { initializeDimensions } from '../src/services/dimensions';
import { calculateGlobalMaturity } from '../src/services/maturityCalculator';
import { validateCoherence } from '../src/services/coherenceValidator';

const prisma = new PrismaClient();

/**
 * Script para simular una evaluación DMA completa
 * Ejecuta: npx tsx scripts/simular-evaluacion-dma.ts
 */

async function simularEvaluacionDMA() {
  console.log('🏭 Iniciando simulación de evaluación DMA...\n');

  try {
    // 1. Crear tenant y usuario
    console.log('1️⃣  Creando tenant y usuario...');
    const tenant = await prisma.tenant.upsert({
      where: { id: 'simulacion-tenant' },
      update: {},
      create: {
        id: 'simulacion-tenant',
        name: 'Empresa de Simulación DMA',
      },
    });

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'simulacion@dma.test' },
      update: {},
      create: {
        email: 'simulacion@dma.test',
        password: hashedPassword,
        name: 'Usuario Simulación',
        tenantId: tenant.id,
        role: 'ADMIN',
      },
    });

    console.log(`   ✅ Tenant: ${tenant.name}`);
    console.log(`   ✅ Usuario: ${user.email}\n`);

    // 2. Crear evaluación
    console.log('2️⃣  Creando evaluación...');
    const evaluation = await prisma.evaluation.create({
      data: {
        name: 'Evaluación DMA - Planta Industrial 2026',
        company: 'Industria Manufacturera S.A.',
        sector: 'Manufactura',
        tenantId: tenant.id,
        createdById: user.id,
        status: 'IN_PROGRESS',
      },
    });

    console.log(`   ✅ Evaluación creada: ${evaluation.name} (ID: ${evaluation.id})\n`);

    // 3. Inicializar dimensiones
    console.log('3️⃣  Inicializando dimensiones y subcriterios...');
    await initializeDimensions(evaluation.id);
    const dimensions = await prisma.dimension.findMany({
      where: { evaluationId: evaluation.id },
      include: { subcriteria: true },
      orderBy: { code: 'asc' },
    });

    console.log(`   ✅ ${dimensions.length} dimensiones inicializadas`);
    console.log(`   ✅ ${dimensions.reduce((sum, d) => sum + d.subcriteria.length, 0)} subcriterios creados\n`);

    // 4. Crear respuestas simuladas
    console.log('4️⃣  Creando respuestas simuladas...');
    let totalResponses = 0;

    for (const dimension of dimensions) {
      for (const subcriterion of dimension.subcriteria) {
        // Simular valores de madurez variados (0-5)
        // D1 (Estrategia): Valores altos (3.5-4.5)
        // D5 (Ciberseguridad): Valores medios-altos (2.5-4.0)
        // D7-D11 (Operativas): Valores variados (2.0-4.0)
        let value = 3.0; // Valor por defecto

        if (dimension.code === 'D1') {
          value = 3.5 + Math.random() * 1.0; // 3.5-4.5
        } else if (dimension.code === 'D5') {
          value = 2.5 + Math.random() * 1.5; // 2.5-4.0
        } else if (['D7', 'D8', 'D9', 'D10', 'D11'].includes(dimension.code)) {
          value = 2.0 + Math.random() * 2.0; // 2.0-4.0
        } else {
          value = 2.5 + Math.random() * 1.5; // 2.5-4.0
        }

        value = Math.round(value * 10) / 10; // Redondear a 1 decimal

        await prisma.response.create({
          data: {
            evaluationId: evaluation.id,
            dimensionId: dimension.id,
            subcriterionId: subcriterion.id,
            value,
            notes: `Respuesta simulada para ${subcriterion.name}`,
            answeredById: user.id,
          },
        });
        totalResponses++;
      }
    }

    console.log(`   ✅ ${totalResponses} respuestas creadas\n`);

    // 5. Calcular madurez
    console.log('5️⃣  Calculando madurez...');
    const maturityResult = await calculateGlobalMaturity(evaluation.id);

    // Recargar evaluación para obtener la clasificación actualizada
    const updatedEvaluation = await prisma.evaluation.findUnique({
      where: { id: evaluation.id },
    });

    console.log(`   📊 Madurez Global: ${maturityResult.globalMaturity.toFixed(2)}`);
    console.log(`   📈 Clasificación: ${updatedEvaluation?.classification || 'Pendiente'}`);
    console.log('\n   Madurez por Dimensión:');
    for (const [code, maturity] of Object.entries(maturityResult.dimensionMaturity)) {
      const dim = dimensions.find((d) => d.code === code);
      console.log(`      ${code}: ${maturity.toFixed(2)} - ${dim?.name || ''}`);
    }
    console.log('');

    // 6. Validar coherencia
    console.log('6️⃣  Validando coherencia...');
    const coherenceResult = await validateCoherence(
      evaluation.id,
      maturityResult.dimensionMaturity
    );

    console.log(`   📊 Score de Coherencia: ${(coherenceResult.score * 100).toFixed(1)}%`);
    console.log(`   📈 Estado: ${coherenceResult.status}`);
    console.log(`   ⚠️  Alertas: ${coherenceResult.alerts.length}`);

    if (coherenceResult.alerts.length > 0) {
      console.log('\n   Alertas detectadas:');
      coherenceResult.alerts.forEach((alert, index) => {
        console.log(`      ${index + 1}. [${alert.type.toUpperCase()}] ${alert.message}`);
        console.log(`         Regla: ${alert.rule}`);
        console.log(`         Sugerencia: ${alert.suggestion}`);
      });
    }
    console.log('');

    // 7. Resumen final
    console.log('📋 RESUMEN DE LA SIMULACIÓN');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Empresa: ${evaluation.company}`);
    console.log(`Evaluación: ${evaluation.name}`);
    console.log(`Estado: ${evaluation.status}`);
    console.log(`Madurez Global: ${maturityResult.globalMaturity.toFixed(2)} / 5.0`);
    console.log(`Clasificación: ${updatedEvaluation?.classification || 'Pendiente'}`);
    console.log(`Coherencia: ${(coherenceResult.score * 100).toFixed(1)}% (${coherenceResult.status})`);
    console.log(`Dimensiones evaluadas: ${dimensions.length}`);
    console.log(`Respuestas registradas: ${totalResponses}`);
    console.log(`Alertas: ${coherenceResult.alerts.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('✅ Simulación completada exitosamente!');
    console.log(`\n🔗 Para ver la evaluación en la base de datos:`);
    console.log(`   npx prisma studio`);
    console.log(`\n📊 Para generar roadmap:`);
    console.log(`   POST /api/roadmap/generate/${evaluation.id}`);
    console.log(`\n📄 Para generar reporte PDF:`);
    console.log(`   GET /api/reports/${evaluation.id}/pdf`);

    return {
      evaluation: updatedEvaluation || evaluation,
      maturityResult,
      coherenceResult,
      dimensions,
      totalResponses,
    };
  } catch (error) {
    console.error('❌ Error en la simulación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar simulación
simularEvaluacionDMA()
  .then(() => {
    console.log('\n🎉 Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
