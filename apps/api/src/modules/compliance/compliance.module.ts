import { Module } from "@nestjs/common";
import { ComplianceController } from "./compliance.controller";
import { ConsentService } from "./consent.service";
import { ErasureService } from "./erasure.service";
import { GrievanceService } from "./grievance.service";

import { NotificationsModule } from "../notifications/notifications.module";
import { ComplianceService } from "./compliance.service";

@Module({
  imports: [NotificationsModule],
  controllers: [ComplianceController],
  providers: [ConsentService, ErasureService, GrievanceService, ComplianceService],
  exports: [ConsentService, ErasureService, GrievanceService, ComplianceService],
})
export class ComplianceModule {}
