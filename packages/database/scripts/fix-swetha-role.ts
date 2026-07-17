import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Renaming CAM to CEM in database enum and updating Swetha...');
  
  // 1. Rename enum value in PostgreSQL
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" RENAME VALUE 'CAM' TO 'CEM'`);
    console.log('Enum value RENAME command run.');
  } catch (e: any) {
    console.log('Enum alteration skipped (might already be renamed):', e.message);
  }

  // 2. Update user records
  await prisma.$executeRawUnsafe(`
    UPDATE "users" 
    SET "email" = 'swetha@naprocs.in' 
    WHERE "email" = 'sweetha@naprocs.in' OR "email" = 'swetha@naprocs.in'
  `);
  
  await prisma.$executeRawUnsafe(`
    UPDATE "employees" 
    SET "officialEmail" = 'swetha@naprocs.in', "employeeId" = 'EMP-CEM-001', "lastName" = 'CEM', "firstName" = 'Swetha' 
    WHERE "officialEmail" = 'sweetha@naprocs.in' OR "officialEmail" = 'swetha@naprocs.in'
  `);

  console.log('Done fixing role and email!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
