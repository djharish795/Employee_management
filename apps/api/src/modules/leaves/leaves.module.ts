import { Module } from "@nestjs/common";
import { LeavesController } from "./leaves.controller";
import { LeavesService } from "./leaves.service";
import { LeavesRepository } from "./leaves.repository";
import { PrismaModule } from "../../prisma/prisma.module";
import { WorkflowsModule } from "../workflows/workflows.module";
import { BullModule } from "@nestjs/bullmq";
import { LeavesProcessor } from "./leaves.processor";
import { LeavesSchedulerService } from "./leaves-scheduler.service";

@Module({
  imports: [
    PrismaModule, 
    WorkflowsModule,
    BullModule.registerQueue({
      name: 'leaves-queue',
    }),
  ],
  controllers: [LeavesController],
  providers: [LeavesService, LeavesRepository, LeavesProcessor, LeavesSchedulerService],
})
export class LeavesModule {}
