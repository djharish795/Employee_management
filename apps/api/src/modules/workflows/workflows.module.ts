import { Module } from "@nestjs/common";
import { WorkflowsController } from "./workflows.controller";
import { WorkflowService } from "./workflow.service";

@Module({
  controllers: [WorkflowsController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowsModule {}
