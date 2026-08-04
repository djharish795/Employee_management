import { Controller, Get, Post, Body, UseGuards, Query, Ip, Patch, Param, BadRequestException, Res, ForbiddenException } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { AttendanceCronService } from "./attendance.cron";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PunchDto } from "./dto/punch.dto";
import { RegularizeDto } from "./dto/regularize.dto";
import { ActionRegularizationDto } from "./dto/action-regularization.dto";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller("attendance")
@UseGuards(JwtAuthGuard, RbacGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly cronService: AttendanceCronService
  ) {}

  @RequirePermissions(RbacPermissions.ATTENDANCE_READ)
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
  async getOrgReports(@CurrentUser() user?: any) {
    try {
      if (user?.role === 'OM') throw new ForbiddenException("OMs cannot view org attendance records");
      return await this.attendanceService.getOrgReports();
    } catch (e: any) {
      throw new BadRequestException(e.message + "\n" + e.stack);
    }
  }

  @Get("summary-today")
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_TEAM_PROFILES)
  async getSummaryToday(
    @Query('date') date?: string,
    @Query('departmentId') departmentId?: string,
    @CurrentUser() user?: any
  ) {
    try {
      if (user?.role === 'OM') throw new ForbiddenException("OMs cannot view attendance records");
      return await this.attendanceService.getSummaryToday(date, departmentId, user);
    } catch (e: any) {
      throw new BadRequestException(e.message + "\n" + e.stack);
    }
  }

  @Get("all-logs")
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_TEAM_PROFILES)
  async getAllLogs(@Query() query: any, @CurrentUser() user?: any) {
    if (user?.role === 'OM') throw new ForbiddenException("OMs cannot view attendance records");
    return this.attendanceService.getAllLogs(query, user);
  }

  @Get("export-all")
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_TEAM_PROFILES)
  async exportAllLogs(@Query() query: any, @CurrentUser() user?: any, @Res() res?: any) {
    if (user?.role === 'OM') throw new ForbiddenException("OMs cannot export attendance records");
    const csv = await this.attendanceService.exportAllLogs(query, user);
    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_logs.csv');
    return res.send(csv);
  }

  @Get("team-view")
  @Permissions(Permission.READ_TEAM_PROFILES)
  async getTeamAttendanceView(
    @CurrentUser() user: any,
    @Query('date') dateStr: string
  ) {
    if (user?.role === 'OM') throw new ForbiddenException("OMs cannot view team attendance");
    if (!dateStr) {
      dateStr = new Date().toISOString();
    }
    return this.attendanceService.getTeamAttendanceView(user.employeeId, dateStr);
  }

  @Get("regularizations")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getRegularizations(@CurrentUser() user: any, @Query('mode') mode?: 'personal' | 'org') {
    return this.attendanceService.getRegularizations(user, mode);
  }

  @Post("regularize")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async createRegularization(
    @CurrentUser() user: any,
    @Body() dto: RegularizeDto
  ) {
    return this.attendanceService.createRegularization(user.employeeId, dto);
  }

  @Patch("regularizations/:id/action")
  @Permissions(Permission.READ_OWN_PROFILE)
  // We remove the strict @Permissions(Permission.WRITE_EMPLOYEES) because managers need to approve their team's requests without needing global WRITE_EMPLOYEES permission.
  // The attendance.service.ts internally verifies if the CurrentUser is the employee's manager or an HR admin.
  async actionRegularization(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ActionRegularizationDto
  ) {
    return this.attendanceService.actionRegularization(id, dto.action, user);
  }

  @Get("pending-overtime")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getPendingOvertime(@CurrentUser() user: any) {
    return this.attendanceService.getPendingOvertime(user.employeeId);
  }

  @Post("records/:id/approve-overtime")
  @Permissions(Permission.READ_OWN_PROFILE)
  async approveOvertime(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: 'APPROVE' | 'REJECT'
  ) {
    return this.attendanceService.approveOvertime(user.employeeId, id, status);
  }
}

