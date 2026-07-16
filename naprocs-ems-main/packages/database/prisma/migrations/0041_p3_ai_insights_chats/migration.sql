-- CreateEnum
CREATE TYPE "AIInsightType" AS ENUM ('ATTRITION', 'SKILL_GAP', 'PROMOTION', 'FORECASTING', 'HIRING');

-- CreateEnum
CREATE TYPE "AITargetType" AS ENUM ('EMPLOYEE', 'DEPARTMENT', 'ORGANIZATION');

-- AlterTable
ALTER TABLE "ai_chats" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "messages" JSONB NOT NULL,
ADD COLUMN     "sessionId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ai_insights" ADD COLUMN     "confidence" DECIMAL(4,3),
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "insight" JSONB NOT NULL,
ADD COLUMN     "modelVersion" TEXT NOT NULL,
ADD COLUMN     "targetId" TEXT NOT NULL,
ADD COLUMN     "targetType" "AITargetType" NOT NULL,
ADD COLUMN     "type" "AIInsightType" NOT NULL;

-- AddForeignKey
ALTER TABLE "ai_chats" ADD CONSTRAINT "ai_chats_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

