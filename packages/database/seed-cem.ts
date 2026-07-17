import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUser(email: string, employeeId: string, firstName: string, role: UserRole = 'CEM' as UserRole) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    console.log(`User ${email} already exists. Updating role to ${role}.`);
    await prisma.user.update({
      where: { email },
      data: { role }
    });
    return;
  }

  const hashedPassword = await bcrypt.hash('ChangeMe123!', 10);
  
  const employee = await prisma.employee.create({
    data: {
      employeeId,
      firstName,
      lastName: role,
      officialEmail: email,
      status: 'ACTIVE',
    }
  });

  await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      role,
      employeeId: employee.id,
    }
  });

  console.log(`Successfully seeded user: ${email} with role ${role}`);
}

async function main() {
  await seedUser('swetha@naprocs.in', 'EMP-CEM-001', 'Swetha', 'CEM' as UserRole);
  await seedUser('divya@naprocs.in', 'EMP-CEM-002', 'Divya', 'CRM' as UserRole);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
