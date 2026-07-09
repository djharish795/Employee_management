import { Module } from "@nestjs/common";
import { LifecycleController } from "./lifecycle.controller";
import { OffboardingService } from "./offboarding.service";

@Module({
  controllers: [LifecycleController],
  providers: [OffboardingService],
  exports: [OffboardingService],
})
export class LifecycleModule {}
