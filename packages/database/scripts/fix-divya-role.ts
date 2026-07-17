import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running fix-divya-role script in the target database...');

  // 1. Ensure CRM is added to UserRole enum (safe raw query)
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CRM'`);
    console.log('✅ CRM role enum value ensured in DB.');
  } catch (err: any) {
    console.log('ℹ️ Attempted to add CRM to enum. (Might fail if already exists or not supported, proceeding):', err.message);
  }

  // 2. Update Divya user role to CRM
  const updateResult = await prisma.$executeRawUnsafe(
    `UPDATE "users" SET "role" = 'CRM' WHERE "email" = 'divya@naprocs.in'`
  );
  console.log(`✅ Updated ${updateResult} rows in users table.`);

  // 3. Mark the migrations as finished to prevent prisma migration desync
  try {
    await prisma.$executeRawUnsafe(`
      UPDATE "_prisma_migrations" 
      SET "applied_steps_count" = 1, "finished_at" = now()
      WHERE "migration_name" = '20260717124000_0051_p1_add_crm_role'
        AND "finished_at" IS NULL
    `);
    console.log('✅ Checked migration entry in _prisma_migrations.');
  } catch (err: any) {
    console.log('ℹ️ Migration entry update skipped:', err.message);
  }

  // 4. Verify Divya's role
  const user = await prisma.$queryRawUnsafe(
    `SELECT email, role FROM "users" WHERE email = 'divya@naprocs.in'`
  );
  console.log('🔍 Divya user record verification:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
