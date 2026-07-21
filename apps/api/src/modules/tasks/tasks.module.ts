import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { AuditModule } from "../audit/audit.module";
import { TasksController, TasksWebhookController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { TasksRepository } from "./tasks.repository";

@Module({
  imports: [NotificationsModule, AuditModule],
  controllers: [TasksController, TasksWebhookController],
  providers: [TasksService, TasksRepository],
  exports: [TasksService],
})
export class TasksModule {}
