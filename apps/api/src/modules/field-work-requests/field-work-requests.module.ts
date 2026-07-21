import { Module } from "@nestjs/common";
import { FieldWorkRequestsController } from "./field-work-requests.controller";
import { FieldWorkRequestsService } from "./field-work-requests.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [FieldWorkRequestsController],
  providers: [FieldWorkRequestsService],
  exports: [FieldWorkRequestsService],
})
export class FieldWorkRequestsModule {}
