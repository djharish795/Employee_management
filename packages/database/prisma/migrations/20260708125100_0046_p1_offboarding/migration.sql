-- CreateTable
CREATE TABLE "offboarding_processes" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "resignationDate" TIMESTAMP(3) NOT NULL,
    "lastWorkingDay" TIMESTAMP(3) NOT NULL,
    "exitType" TEXT NOT NULL,
    "exitReason" TEXT,
    "accessRevocationDate" TIMESTAMP(3),
    "ktAssigneeId" TEXT,
    "ktTargetDate" TIMESTAMP(3),
    "ffExpectedDate" TIMESTAMP(3),
    "generateLetters" BOOLEAN NOT NULL DEFAULT true,
    "exitInterviewDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "assetChecklist" JSONB NOT NULL DEFAULT '[]',
    "deactivationChecklist" JSONB NOT NULL DEFAULT '[]',
    "settlementChecklist" JSONB NOT NULL DEFAULT '[]',
    "ktChecklist" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offboarding_processes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offboarding_processes_employeeId_key" ON "offboarding_processes"("employeeId");

-- AddForeignKey
ALTER TABLE "offboarding_processes" ADD CONSTRAINT "offboarding_processes_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offboarding_processes" ADD CONSTRAINT "offboarding_processes_ktAssigneeId_fkey" FOREIGN KEY ("ktAssigneeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
