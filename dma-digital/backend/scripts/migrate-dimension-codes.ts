import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCodes() {
  console.log('🔄 Iniciando migración de códigos de dimensiones en la base de datos...');

  try {
    // 1. Migrar dimensiones
    const dimensions = await prisma.dimension.findMany({
      where: {
        code: {
          in: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9'],
        },
      },
    });

    console.log(`   Encontradas ${dimensions.length} dimensiones para actualizar.`);
    
    let updatedDims = 0;
    for (const dim of dimensions) {
      const num = parseInt(dim.code.substring(1), 10);
      const newCode = `D0${num}`;
      
      await prisma.dimension.update({
        where: { id: dim.id },
        data: { code: newCode },
      });
      updatedDims++;
    }
    console.log(`   ✅ ${updatedDims} dimensiones actualizadas.`);

    // 2. Migrar subcriterios
    const subcriteria = await prisma.subcriterion.findMany();
    let updatedSubs = 0;
    
    for (const sub of subcriteria) {
      const match = sub.code.match(/^D(\d+)\.(\d+)$/);
      if (match) {
        const dimNum = parseInt(match[1], 10);
        if (dimNum >= 1 && dimNum <= 9) {
          const subNum = parseInt(match[2], 10);
          const newCode = `D0${dimNum}.${subNum}`;
          
          await prisma.subcriterion.update({
            where: { id: sub.id },
            data: { code: newCode },
          });
          updatedSubs++;
        }
      }
    }
    console.log(`   ✅ ${updatedSubs} subcriterios actualizados.`);

    // 3. Migrar benchmark_data
    const benchmarks = await prisma.benchmarkData.findMany({
      where: {
        dimensionCode: {
          in: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9'],
        },
      },
    });
    
    console.log(`   Encontrados ${benchmarks.length} registros de benchmark para actualizar.`);
    
    let updatedBenchmarks = 0;
    for (const bench of benchmarks) {
      if (bench.dimensionCode) {
        const num = parseInt(bench.dimensionCode.substring(1), 10);
        const newCode = `D0${num}`;
        
        await prisma.benchmarkData.update({
          where: { id: bench.id },
          data: { dimensionCode: newCode },
        });
        updatedBenchmarks++;
      }
    }
    console.log(`   ✅ ${updatedBenchmarks} registros de benchmark actualizados.`);
    console.log('\n🎉 ¡Migración finalizada con éxito!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCodes();
