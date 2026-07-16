-- CreateEnum
CREATE TYPE "ReadinessLevel" AS ENUM ('READY_NOW', 'READY_1_YEAR', 'READY_2_YEARS', 'DEVELOPING');

-- CreateEnum
CREATE TYPE "TalentApplicationStatus" AS ENUM ('APPLIED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransferRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "succession_plans" ADD COLUMN     "developmentPlan" TEXT,
ADD COLUMN     "gapAnalysis" TEXT,
ADD COLUMN     "incumbentId" TEXT,
ADD COLUMN     "readinessLevel" "ReadinessLevel" NOT NULL DEFAULT 'DEVELOPING',
ADD COLUMN     "roleTitle" TEXT NOT NULL,
ADD COLUMN     "successorId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "talent_applications" ADD COLUMN     "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "jobId" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "TalentApplicationStatus" NOT NULL DEFAULT 'APPLIED';

-- AlterTable
ALTER TABLE "transfer_requests" ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "fromDepartmentId" TEXT NOT NULL,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processedById" TEXT,
ADD COLUMN     "reason" TEXT NOT NULL,
ADD COLUMN     "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "TransferRequestStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "toDepartmentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "succession_plans" ADD CONSTRAINT "succession_plans_incumbentId_fkey" FOREIGN KEY ("incumbentId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "succession_plans" ADD CONSTRAINT "succession_plans_successorId_fkey" FOREIGN KEY ("successorId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_applications" ADD CONSTRAINT "talent_applications_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_applications" ADD CONSTRAINT "talent_applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_fromDepartmentId_fkey" FOREIGN KEY ("fromDepartmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_toDepartmentId_fkey" FOREIGN KEY ("toDepartmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_requests" ADD CONSTRAINT "transfer_requests_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

