-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPROVAL_ALERT', 'POLICY_UPDATE', 'BIRTHDAY', 'ANNIVERSARY', 'SYSTEM_ALERT', 'SECURITY_ALERT', 'LEAVE_STATUS', 'ASSET_STATUS', 'GENERAL');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "body" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "data" JSONB,
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "recipientId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- CreateIndex
CREATE INDEX "notifications_recipientId_isRead_idx" ON "notifications"("recipientId", "isRead");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

