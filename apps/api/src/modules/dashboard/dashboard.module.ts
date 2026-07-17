import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { AttendanceModule } from "../attendance/attendance.module";

@Module({
  imports: [PrismaModule, AttendanceModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
