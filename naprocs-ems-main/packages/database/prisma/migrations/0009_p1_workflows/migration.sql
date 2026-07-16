-- CreateEnum
CREATE TYPE "WorkflowType" AS ENUM ('LEAVE', 'ASSET_REQUEST', 'RECRUITMENT', 'PROMOTION', 'OFFBOARDING');

-- CreateEnum
CREATE TYPE "WorkflowInstanceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "workflow_instances" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentStepIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "initiatedById" TEXT NOT NULL,
ADD COLUMN     "resourceId" TEXT NOT NULL,
ADD COLUMN     "resourceType" TEXT NOT NULL,
ADD COLUMN     "status" "WorkflowInstanceStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workflowId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "workflows" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "steps" JSONB NOT NULL,
ADD COLUMN     "type" "WorkflowType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "workflow_instances_resourceType_resourceId_idx" ON "workflow_instances"("resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "workflows_type_key" ON "workflows"("type");

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_initiatedById_fkey" FOREIGN KEY ("initiatedById") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

