-- AlterTable
ALTER TABLE "leave_requests" ADD COLUMN "approvalQueue" JSONB;
ALTER TABLE "leave_requests" ADD COLUMN "currentStep" INTEGER NOT NULL DEFAULT 0;
