import { Module } from "@nestjs/common";
import { EmployeesController } from "./employees.controller";
import { TeamController } from "./team.controller";
import { EmployeesService } from "./employees.service";
import { RedisModule } from "../../redis/redis.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [RedisModule, NotificationsModule],
  controllers: [EmployeesController, TeamController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
