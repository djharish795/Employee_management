import { Controller, Get, Post, Body, UseGuards, Query, Ip } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PunchDto } from "./dto/punch.dto";

@Controller("attendance")
@UseGuards(JwtAuthGuard, RbacGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get("today")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getTodayStatus(@CurrentUser() user: any) {
    return this.attendanceService.getTodayStatus(user.employeeId);
  }

  @Post("punch")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async punch(
    @CurrentUser() user: any,
    @Body() dto: PunchDto,
    @Ip() ip: string
  ) {
    return this.attendanceService.punch(user.employeeId, dto, ip);
  }

  @Get("my-logs")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getMyLogs(
    @CurrentUser() user: any,
    @Query() query: any
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    return this.attendanceService.getMyLogs(user.employeeId, query);
  }

  @Get("my-kpis")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getMyKpis(@CurrentUser() user: any) {
    return this.attendanceService.getMyKpis(user.employeeId);
  }

  @Get("org-reports")
  @Permissions(Permission.READ_EMPLOYEES)
  async getOrgReports() {
    try {
      return await this.attendanceService.getOrgReports();
    } catch (e: any) {
      const { BadRequestException } = require('@nestjs/common');
      throw new BadRequestException(e.message + "\n" + e.stack);
    }
  }
}
