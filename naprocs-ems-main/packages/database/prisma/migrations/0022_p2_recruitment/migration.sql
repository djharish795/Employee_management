-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "CandidateStage" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'JOINED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('PHONE', 'VIDEO', 'IN_PERSON', 'TECHNICAL', 'HR');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "InterviewRecommendation" AS ENUM ('STRONG_YES', 'YES', 'NO', 'STRONG_NO');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentCTC" DECIMAL(12,2),
ADD COLUMN     "currentStage" "CandidateStage" NOT NULL DEFAULT 'APPLIED',
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "expectedCTC" DECIMAL(12,2),
ADD COLUMN     "jobId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "noticePeriod" INTEGER,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "resumeUrl" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "sourceChannel" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "candidateId" TEXT NOT NULL,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "interviewerId" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER,
ADD COLUMN     "recommendation" "InterviewRecommendation",
ADD COLUMN     "scheduledAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "type" "InterviewType" NOT NULL;

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ctcMax" DECIMAL(12,2),
ADD COLUMN     "ctcMin" DECIMAL(12,2),
ADD COLUMN     "departmentId" TEXT NOT NULL,
ADD COLUMN     "filledPositions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hiringManagerId" TEXT NOT NULL,
ADD COLUMN     "jobDescription" TEXT NOT NULL,
ADD COLUMN     "maxExperience" INTEGER NOT NULL,
ADD COLUMN     "minExperience" INTEGER NOT NULL,
ADD COLUMN     "openPositions" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "requiredSkills" TEXT[],
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "targetDate" DATE,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "candidateId" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "joiningDate" DATE,
ADD COLUMN     "offerLetterUrl" TEXT,
ADD COLUMN     "offeredCTC" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX "offers_candidateId_key" ON "offers"("candidateId");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_hiringManagerId_fkey" FOREIGN KEY ("hiringManagerId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

