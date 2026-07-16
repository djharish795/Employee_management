import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { TasksRepository } from "./tasks.repository";

@Module({
  imports: [NotificationsModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
  exports: [TasksService],
})
export class TasksModule {}
