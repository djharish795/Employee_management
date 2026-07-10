import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { WorkflowsController } from "./workflows.controller";
import { WorkflowService } from "./workflow.service";
import { WorkflowEngineService } from "./workflow-engine.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    NotificationsModule
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowService, WorkflowEngineService],
  exports: [WorkflowService, WorkflowEngineService],
})
export class WorkflowsModule {}
