import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Running fix-roles script...');

  // Ensure CRM and CEM are added to UserRole enum (safe raw query)
  try {
    await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CRM'`);
    await prisma.$executeRawUnsafe(`ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CEM'`);
    console.log('✅ CRM & CEM role enum values ensured in DB.');
  } catch (err: any) {
    console.log('ℹ️ Attempted to add CRM/CEM to enum. (Might fail if already exists or not supported, proceeding):', err.message);
  }

  // Update Swetha
  const swethaUser = await prisma.$executeRawUnsafe(
    `UPDATE "users" SET "role" = 'CEM' WHERE "email" = 'swetha@naprocs.in'`
  );
  console.log(`✅ Updated ${swethaUser} rows in users table for Swetha.`);

  const swethaEmp = await prisma.$executeRawUnsafe(
    `UPDATE "employees" SET "lastName" = 'CEM' WHERE "officialEmail" = 'swetha@naprocs.in'`
  );
  console.log(`✅ Updated ${swethaEmp} rows in employees table for Swetha.`);

  // Update Divya
  const divyaUser = await prisma.$executeRawUnsafe(
    `UPDATE "users" SET "role" = 'CRM' WHERE "email" = 'divya@naprocs.in'`
  );
  console.log(`✅ Updated ${divyaUser} rows in users table for Divya.`);

  const divyaEmp = await prisma.$executeRawUnsafe(
    `UPDATE "employees" SET "lastName" = 'CRM' WHERE "officialEmail" = 'divya@naprocs.in'`
  );
  console.log(`✅ Updated ${divyaEmp} rows in employees table for Divya.`);

  // Mark migrations as finished to prevent prisma migration desync
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

  const users = await prisma.$queryRawUnsafe(
    `SELECT email, role FROM "users" WHERE email IN ('swetha@naprocs.in', 'divya@naprocs.in')`
  );
  console.log('🔍 Verified user records:', users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
