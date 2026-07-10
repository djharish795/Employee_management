import { Module } from "@nestjs/common";
import {
  AssetsController,
  AssetsKpiController,
  AssetRequestsController,
  CtoAssetsController,
} from "./assets.controller";
import { AssetsService } from "./assets.service";
import { AssetsRepository } from "./assets.repository";
import { PrismaModule } from "../../prisma/prisma.module";
import { WorkflowsModule } from "../workflows/workflows.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [PrismaModule, WorkflowsModule, AuditModule],
  controllers: [
    AssetsKpiController,
    AssetRequestsController,
    AssetsController,
    CtoAssetsController,
  ],
  providers: [AssetsService, AssetsRepository],
  exports: [AssetsService],
})
export class AssetsModule {}
