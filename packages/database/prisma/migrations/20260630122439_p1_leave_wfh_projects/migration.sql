-- AlterEnum
ALTER TYPE "AttendanceStatus" ADD VALUE 'EARLY_CHECKOUT';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'OPERATIONS_HEAD';

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "accountType" TEXT,
ADD COLUMN     "bankAccountEnc" TEXT,
ADD COLUMN     "bankBranch" TEXT,
ADD COLUMN     "bankIfsc" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "documents" JSONB,
ADD COLUMN     "paymentFrequency" TEXT,
ADD COLUMN     "paymentMode" TEXT;

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_assignments" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wfh_requests" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveRequestStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "approverId" TEXT,
    "approvalQueue" JSONB,
    "currentStep" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "wfh_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_holidays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_assignments_projectId_employeeId_key" ON "project_assignments"("projectId", "employeeId");

-- CreateIndex
CREATE INDEX "wfh_requests_employeeId_status_idx" ON "wfh_requests"("employeeId", "status");

-- AddForeignKey
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_assignments" ADD CONSTRAINT "project_assignments_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wfh_requests" ADD CONSTRAINT "wfh_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wfh_requests" ADD CONSTRAINT "wfh_requests_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
