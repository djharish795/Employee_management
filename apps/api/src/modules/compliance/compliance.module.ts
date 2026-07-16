import { Module } from "@nestjs/common";
import { ComplianceController } from "./compliance.controller";
import { ConsentService } from "./consent.service";
import { ErasureService } from "./erasure.service";
import { GrievanceService } from "./grievance.service";

@Module({
  controllers: [ComplianceController],
  providers: [ConsentService, ErasureService, GrievanceService],
  exports: [ConsentService, ErasureService, GrievanceService],
})
export class ComplianceModule {}
