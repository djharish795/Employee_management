import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Mark the CRM migration as applied in _prisma_migrations
  await prisma.$executeRawUnsafe(`
    UPDATE "_prisma_migrations" 
    SET "applied_steps_count" = 1, "finished_at" = now()
    WHERE "migration_name" = '20260717124000_0051_p1_add_crm_role'
      AND "finished_at" IS NULL
  `);
  
  // Verify Divya's role
  const user = await prisma.$queryRawUnsafe(
    `SELECT email, role FROM "users" WHERE email = 'divya@naprocs.in'`
  );
  console.log('Divya user record:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
