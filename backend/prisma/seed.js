import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';  // lightweight, fast, secure

const prisma = new PrismaClient();

async function main() {
  // Hash the password before inserting
  const hashedPassword = await bcrypt.hash('Irisa@123', 10); // 10 salt rounds is industry standard

  const admin = await prisma.user.upsert({
    where: { email: 'irisarolande25@gmail.com' },
    update: {},
    create: {
      email: 'irisarolande25@gmail.com',
      name: 'ADMIN',
      password: hashedPassword,  // hashed, not plain text
      role: 'ADMIN',
      verificationStatus: 'VERIFIED',
    },
  });

  console.log('✅ Seeding complete:', admin);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
