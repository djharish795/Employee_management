-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('OKR', 'KPI', 'PERSONAL');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MISSED');

-- CreateEnum
CREATE TYPE "ReviewCycleType" AS ENUM ('QUARTERLY', 'HALF_YEARLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "ReviewCycleStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('SELF', 'MANAGER', 'PEER', 'SKIP_LEVEL');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'SUBMITTED', 'ACKNOWLEDGED');

-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentValue" DECIMAL(10,2),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dueDate" DATE,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "reviewCycleId" TEXT,
ADD COLUMN     "status" "GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "targetValue" DECIMAL(10,2),
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" "GoalType" NOT NULL,
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "weight" DECIMAL(5,2);

-- AlterTable
ALTER TABLE "performance_reviews" ADD COLUMN     "acknowledgedAt" TIMESTAMP(3),
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "overallRating" DECIMAL(3,1),
ADD COLUMN     "reviewCycleId" TEXT NOT NULL,
ADD COLUMN     "reviewerId" TEXT NOT NULL,
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "type" "ReviewType" NOT NULL;

-- AlterTable
ALTER TABLE "review_cycles" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" DATE NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "quarter" INTEGER,
ADD COLUMN     "startDate" DATE NOT NULL,
ADD COLUMN     "status" "ReviewCycleStatus" NOT NULL DEFAULT 'UPCOMING',
ADD COLUMN     "type" "ReviewCycleType" NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_reviewCycleId_fkey" FOREIGN KEY ("reviewCycleId") REFERENCES "review_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewCycleId_fkey" FOREIGN KEY ("reviewCycleId") REFERENCES "review_cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

