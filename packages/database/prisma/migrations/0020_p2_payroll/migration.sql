-- CreateEnum
CREATE TYPE "PayrollRunStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PayrollLineItemStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- AlterTable
ALTER TABLE "payroll_line_items" ADD COLUMN     "bankAccountEnc" TEXT NOT NULL,
ADD COLUMN     "basicSalary" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "esi" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "grossSalary" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "hra" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "ifscCode" TEXT NOT NULL,
ADD COLUMN     "netSalary" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "payrollRunId" TEXT NOT NULL,
ADD COLUMN     "payslipUrl" TEXT,
ADD COLUMN     "pfEmployee" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "pfEmployer" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "professionalTax" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "specialAllowance" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "status" "PayrollLineItemStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "tds" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalDeductions" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "payroll_runs" ADD COLUMN     "bankFileName" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "initiatedById" TEXT NOT NULL,
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "processedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" "PayrollRunStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "totalAmount" DECIMAL(14,2),
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "salary_structures" ADD COLUMN     "basicSalary" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "ctc" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "effectiveFrom" DATE NOT NULL,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "esiEligible" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hra" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "pfEligible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "specialAllowance" DECIMAL(12,2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payroll_line_items_payrollRunId_employeeId_key" ON "payroll_line_items"("payrollRunId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_month_year_key" ON "payroll_runs"("month", "year");

-- AddForeignKey
ALTER TABLE "salary_structures" ADD CONSTRAINT "salary_structures_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_structures" ADD CONSTRAINT "salary_structures_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_line_items" ADD CONSTRAINT "payroll_line_items_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "payroll_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_line_items" ADD CONSTRAINT "payroll_line_items_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

