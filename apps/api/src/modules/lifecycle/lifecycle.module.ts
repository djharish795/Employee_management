import { Module } from "@nestjs/common";
import { LifecycleController } from "./lifecycle.controller";
import { OffboardingService } from "./offboarding.service";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [LifecycleController],
  providers: [OffboardingService],
  exports: [OffboardingService],
})
export class LifecycleModule {}
