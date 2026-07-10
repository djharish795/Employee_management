import { Module } from "@nestjs/common";
import { LeavesController } from "./leaves.controller";
import { LeavesService } from "./leaves.service";
import { LeavesRepository } from "./leaves.repository";
import { PrismaModule } from "../../prisma/prisma.module";
import { WorkflowsModule } from "../workflows/workflows.module";

@Module({
  imports: [PrismaModule, WorkflowsModule],
  controllers: [LeavesController],
  providers: [LeavesService, LeavesRepository],
})
export class LeavesModule {}
