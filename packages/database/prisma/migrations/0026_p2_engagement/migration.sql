-- CreateEnum
CREATE TYPE "SurveyType" AS ENUM ('PULSE', 'MOOD', 'EXIT', 'ONBOARDING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SurveyAudience" AS ENUM ('ALL', 'DEPARTMENT', 'TEAM');

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "RecognitionType" AS ENUM ('KUDOS', 'AWARD', 'BADGE');

-- AlterTable
ALTER TABLE "recognitions" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fromEmployeeId" TEXT NOT NULL,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "toEmployeeId" TEXT NOT NULL,
ADD COLUMN     "type" "RecognitionType" NOT NULL;

-- AlterTable
ALTER TABLE "survey_responses" ADD COLUMN     "answers" JSONB NOT NULL,
ADD COLUMN     "respondentId" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "surveyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "surveys" ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "endDate" DATE NOT NULL,
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "questions" JSONB NOT NULL,
ADD COLUMN     "startDate" DATE NOT NULL,
ADD COLUMN     "status" "SurveyStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "targetAudience" "SurveyAudience" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" "SurveyType" NOT NULL;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "surveys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_responses" ADD CONSTRAINT "survey_responses_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_fromEmployeeId_fkey" FOREIGN KEY ("fromEmployeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recognitions" ADD CONSTRAINT "recognitions_toEmployeeId_fkey" FOREIGN KEY ("toEmployeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

