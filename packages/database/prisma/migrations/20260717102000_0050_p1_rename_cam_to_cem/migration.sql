-- AlterEnum
ALTER TYPE "UserRole" RENAME VALUE 'CAM' TO 'CEM';

-- Update email and metadata for seeded user
UPDATE "users" SET "email" = 'swetha@naprocs.in' WHERE "email" = 'sweetha@naprocs.in';
UPDATE "employees" SET "officialEmail" = 'swetha@naprocs.in', "employeeId" = 'EMP-CEM-001', "lastName" = 'CEM', "firstName" = 'Swetha' WHERE "officialEmail" = 'sweetha@naprocs.in';
