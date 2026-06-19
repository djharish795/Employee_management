/*
  Warnings:

  - You are about to drop the column `designation` on the `employees` table. All the data in the column will be lost.
  - The `status` column on the `employees` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('PROBATION', 'ACTIVE', 'NOTICE_PERIOD', 'EXITED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN');

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "designation",
ADD COLUMN     "aadhaar" TEXT,
ADD COLUMN     "alternatePhone" TEXT,
ADD COLUMN     "backgroundVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "band" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "currentAddress" JSONB,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "designationId" TEXT,
ADD COLUMN     "digitalSignatureUrl" TEXT,
ADD COLUMN     "drivingLicence" TEXT,
ADD COLUMN     "emergencyContact" JSONB,
ADD COLUMN     "employeeType" "EmployeeType" DEFAULT 'FULL_TIME',
ADD COLUMN     "exitDate" TIMESTAMP(3),
ADD COLUMN     "exitReason" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "joiningDate" TIMESTAMP(3),
ADD COLUMN     "maritalStatus" "MaritalStatus",
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "nationality" TEXT DEFAULT 'Indian',
ADD COLUMN     "pan" TEXT,
ADD COLUMN     "passport" TEXT,
ADD COLUMN     "permanentAddress" JSONB,
ADD COLUMN     "personalEmail" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "preferredName" TEXT,
ADD COLUMN     "reportingManagerId" TEXT,
ADD COLUMN     "skipLevelManagerId" TEXT,
ADD COLUMN     "voterId" TEXT,
ADD COLUMN     "workLocation" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "EmployeeStatus" NOT NULL DEFAULT 'PROBATION';

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_reportingManagerId_fkey" FOREIGN KEY ("reportingManagerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_skipLevelManagerId_fkey" FOREIGN KEY ("skipLevelManagerId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
