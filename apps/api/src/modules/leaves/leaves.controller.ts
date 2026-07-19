import { Controller, Get, Post, Body, Param, Req, UseGuards, Query, ForbiddenException } from '@nestjs/common';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { RbacGuard } from '../../common/guards/rbac.guard';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RbacGuard)
export class LeavesController {

  constructor(private readonly leaveService: LeavesService) { }

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Get('kpi')
  getLeavesKPI(
    @Query('employeeId') requestedId: string,
    @CurrentUser() user: any
  ): Promise<unknown> {
    // SECURITY: Ownership enforcement.
    // Privileged roles (HR, CHRO, MANAGER, CTO, CEO, SUPER_ADMIN) can query any employee's KPI.
    // Regular employees can ONLY query their own KPI — any attempt to pass another
    // employee's ID is rejected with a 403 Forbidden.
    const privilegedRoles = ['HR', 'CHRO', 'MANAGER', 'TEAM_LEAD', 'CTO', 'CEO', 'COO', 'SUPER_ADMIN', 'FINANCE', 'CFO', 'CHRO'];
    const callerRole = (user.role as string)?.toUpperCase();
    const targetId = requestedId || user.employeeId;

    if (targetId !== user.employeeId && !privilegedRoles.includes(callerRole)) {
      throw new ForbiddenException('You can only view your own leave KPI.');
    }

    return this.leaveService.getLeavesKPI(targetId);
  }

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Get('approvals/:approverId')
  getApprovals(@Param('approverId') approverId: string): Promise<unknown> {
    return this.leaveService.getApprovals(approverId);
  }

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Get('my')
  getMyLeaves(@Req() req: any): Promise<unknown> {
    // Assuming JwtAuthGuard adds user info to req.user
    const employeeId = req.user?.employeeId || req.query.employeeId;
    return this.leaveService.getMyLeaves(employeeId);
  }

  @RequirePermissions(RbacPermissions.LEAVE_CREATE)
  @Post('apply')
  applyLeave(@Body() data: ApplyLeaveDto, @Req() req: any): Promise<unknown> {
    const employeeId = req.user?.employeeId;
    return this.leaveService.applyLeave({ ...data, employeeId });
  }

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Post('calculate')
  calculateLeave(@Body() data: ApplyLeaveDto, @Req() req: any): Promise<unknown> {
    const employeeId = req.user?.employeeId;
    return this.leaveService.calculateLeave({ ...data, employeeId });
  }

  @RequirePermissions(RbacPermissions.LEAVE_APPROVE)
  @Post(':id/approve')
  approveLeave(@Param('id') id: string, @Req() req: any): Promise<unknown> {
    const approverId = req.user?.employeeId;
    return this.leaveService.approveLeave(id, approverId);
  }

  @RequirePermissions(RbacPermissions.LEAVE_REJECT)
  @Post(':id/reject')
  rejectLeave(@Param('id') id: string, @Req() req: any, @Body('reason') reason: string): Promise<unknown> {
    const approverId = req.user?.employeeId;
    return this.leaveService.rejectLeave(id, approverId, reason || 'No reason provided');
  }

  @RequirePermissions(RbacPermissions.LEAVE_CREATE)
  @Post(':id/cancel')
  cancelLeave(@Param('id') id: string, @Req() req: any): Promise<unknown> {
    const employeeId = req.user?.employeeId || req.query.employeeId;
    return this.leaveService.cancelLeave(id, employeeId);
  }

  @RequirePermissions(RbacPermissions.LEAVE_APPROVE)
  @Post('admin/accrue-monthly')
  accrueMonthlyLeaves(): Promise<unknown> {
    return this.leaveService.accrueMonthlyLeaves();
  }

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Get('calendar')
  getCalendar(@CurrentUser() user: any): Promise<unknown> {
    // Always use the authenticated user's own ID from the JWT
    return this.leaveService.getCalendar(user.employeeId);
  }

}
