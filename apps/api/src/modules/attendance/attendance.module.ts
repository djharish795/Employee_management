import { Module } from "@nestjs/common";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";
import { RedisModule } from "../../redis/redis.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { AttendanceCronService } from "./attendance.cron";

@Module({
  imports: [RedisModule, PrismaModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceCronService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
