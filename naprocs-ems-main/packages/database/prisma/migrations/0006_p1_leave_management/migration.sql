-- CreateEnum
CREATE TYPE "LeaveRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "leave_balances" ADD COLUMN     "allocated" DECIMAL(4,1) NOT NULL,
ADD COLUMN     "carriedOver" DECIMAL(4,1) NOT NULL DEFAULT 0,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "leaveTypeId" TEXT NOT NULL,
ADD COLUMN     "pending" DECIMAL(4,1) NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "used" DECIMAL(4,1) NOT NULL DEFAULT 0,
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "leave_requests" ADD COLUMN     "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approverId" TEXT,
ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "endDate" DATE NOT NULL,
ADD COLUMN     "halfDaySession" TEXT,
ADD COLUMN     "isHalfDay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leaveTypeId" TEXT NOT NULL,
ADD COLUMN     "reason" TEXT NOT NULL,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "startDate" DATE NOT NULL,
ADD COLUMN     "status" "LeaveRequestStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "totalDays" DECIMAL(4,1) NOT NULL,
ADD COLUMN     "workflowInstanceId" TEXT;

-- AlterTable
ALTER TABLE "leave_types" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isCarryForwardAllowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPaidLeave" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxCarryForwardDays" DECIMAL(4,1),
ADD COLUMN     "maxDaysPerYear" DECIMAL(4,1) NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "requiresDocumentAbove" DECIMAL(4,1);

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employeeId_leaveTypeId_year_key" ON "leave_balances"("employeeId", "leaveTypeId", "year");

-- CreateIndex
CREATE INDEX "leave_requests_employeeId_status_idx" ON "leave_requests"("employeeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_name_key" ON "leave_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_code_key" ON "leave_types"("code");

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

