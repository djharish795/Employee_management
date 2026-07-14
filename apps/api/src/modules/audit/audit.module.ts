import { Global, Module } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { AuditController } from "./audit.controller";
import { AuditRepository } from "./audit.repository";

@Global()
@Module({
  controllers: [AuditController],
  providers: [AuditService, AuditRepository],
  exports: [AuditService, AuditRepository],
})
export class AuditModule {}
