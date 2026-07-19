import { Module } from "@nestjs/common";
import {
  AssetsController,
  AssetsKpiController,
  AssetRequestsController,
} from "./assets.controller";
import { AssetsService } from "./assets.service";
import { AssetsRepository } from "./assets.repository";
import { PrismaModule } from "../../prisma/prisma.module";
import { WorkflowsModule } from "../workflows/workflows.module";
import { AuditModule } from "../audit/audit.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [PrismaModule, WorkflowsModule, AuditModule, NotificationsModule],
  controllers: [
    AssetsKpiController,
    AssetRequestsController,
    AssetsController,
  ],
  providers: [AssetsService, AssetsRepository],
  exports: [AssetsService],
})
export class AssetsModule {}
