import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'irisarolande25@gmail.com';

  // Hash the password
  const hashedPassword = await bcrypt.hash('Irisa@123', 10);

  await prisma.user.upsert({
    where: { email },
    update: {}, // no update for now, just creates if not exists
    create: {
      email,
      password: hashedPassword,
      name: 'Irisa',
      plateNumber: 'RDAADMIN1',
      role: 'ADMIN', // Capitalized to match enum if 
      verificationStatus: 'VERIFIED',
    },
  });

  console.log('✅ Admin user seeded');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
