import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@elico.com';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Administrador';

  // Crear tenant por defecto
  let tenant = await prisma.tenant.findFirst({
    where: { name: 'ELICO Default' },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'ELICO Default',
      },
    });
  }

  // Crear usuario
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log('Usuario creado exitosamente:');
  console.log(`Email: ${user.email}`);
  console.log(`Nombre: ${user.name}`);
  console.log(`Rol: ${user.role}`);
  console.log(`Tenant: ${tenant.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
