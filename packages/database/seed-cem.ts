import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'swetha@naprocs.in';
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log(`User ${email} already exists. Updating role to CEM.`);
    await prisma.user.update({
      where: { email },
      data: { role: 'CEM' as UserRole }
    });
    return;
  }

  const hashedPassword = await bcrypt.hash('Naprocs@123', 10);
  
  const employee = await prisma.employee.create({
    data: {
      employeeId: 'EMP-CEM-001',
      firstName: 'Swetha',
      lastName: 'CEM',
      officialEmail: email,
      status: 'ACTIVE',
    }
  });

  await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      role: 'CEM' as UserRole,
      employeeId: employee.id,
    }
  });

  console.log(`Successfully seeded CEM user: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
