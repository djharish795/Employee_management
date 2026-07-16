-- AlterTable
ALTER TABLE "attendance_records" ADD COLUMN "currentBreakStartTime" TIMESTAMP(3);
ALTER TABLE "attendance_records" ADD COLUMN "totalBreakSeconds" INTEGER NOT NULL DEFAULT 0;
