-- DropIndex
DROP INDEX "knowledge_docs_search_idx";

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "actorId" TEXT,
ADD COLUMN     "deviceId" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "newValue" JSONB,
ADD COLUMN     "oldValue" JSONB,
ADD COLUMN     "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "requestId" TEXT NOT NULL,
ADD COLUMN     "resource" TEXT NOT NULL,
ADD COLUMN     "resourceId" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "audit_logs_resource_resourceId_idx" ON "audit_logs"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_performedAt_idx" ON "audit_logs"("performedAt");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER AS $foo$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only. UPDATE and DELETE are forbidden.';
END;
$foo$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

CREATE TRIGGER audit_logs_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();
