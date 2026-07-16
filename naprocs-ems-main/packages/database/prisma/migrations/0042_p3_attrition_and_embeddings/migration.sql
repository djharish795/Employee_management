-- CreateExtension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable
ALTER TABLE "attrition_risk_scores" ADD COLUMN     "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "factors" JSONB NOT NULL,
ADD COLUMN     "modelVersion" TEXT NOT NULL,
ADD COLUMN     "recommendation" TEXT,
ADD COLUMN     "riskLevel" "RiskLevel" NOT NULL,
ADD COLUMN     "riskScore" DECIMAL(4,3) NOT NULL,
ADD COLUMN     "validUntil" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "embedding_vectors" ADD COLUMN     "chunkIndex" INTEGER NOT NULL,
ADD COLUMN     "chunkText" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "documentId" TEXT NOT NULL,
ADD COLUMN     "documentType" TEXT NOT NULL,
ADD COLUMN     "embedding" vector(1536),
ADD COLUMN     "model" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "attrition_risk_scores" ADD CONSTRAINT "attrition_risk_scores_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

