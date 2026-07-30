import { Controller, Get, Post, Body, Param, Req, UseGuards, Query, ForbiddenException } from '@nestjs/common';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RbacGuard)
@Permissions(Permission.READ_OWN_PROFILE, Permission.WRITE_OWN_PROFILE)
export class LeavesController {

  constructor(private readonly leaveService: LeavesService) { }

  @Get('kpi')
  getLeavesKPI(
    @Query('employeeId') requestedId: string
  ): Promise<unknown> {
    const targetId = requestedId || 'cmruoh6lc0009jpd1gf2q15im'; // fallback ID for testing
    return this.leaveService.getLeavesKPI(targetId);
  }

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Get('approvals')
  getApprovals(@CurrentUser() user: any): Promise<unknown> {
    return this.leaveService.getApprovals(user.employeeId);
  }

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Get('my')
  getMyLeaves(@CurrentUser() user: any): Promise<unknown> {
    const employeeId = user?.employeeId;
    if (!employeeId) throw new ForbiddenException('Invalid session');
    return this.leaveService.getMyLeaves(employeeId);
  }

  @RequirePermissions(RbacPermissions.LEAVE_CREATE)
  @Post('apply')
  applyLeave(@Body() data: ApplyLeaveDto, @CurrentUser() user: any): Promise<unknown> {
    const employeeId = user?.employeeId;
    if (!employeeId) throw new ForbiddenException('Invalid session');
    return this.leaveService.applyLeave({ ...data, employeeId });
  }

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Post('calculate')
  calculateLeave(@Body() data: ApplyLeaveDto, @CurrentUser() user: any): Promise<unknown> {
    const employeeId = user?.employeeId;
    if (!employeeId) throw new ForbiddenException('Invalid session');
    return this.leaveService.calculateLeave({ ...data, employeeId });
  }

  @RequirePermissions(RbacPermissions.LEAVE_APPROVE)
  @Post(':id/approve')
  approveLeave(@Param('id') id: string, @CurrentUser() user: any): Promise<unknown> {
    const approverId = user?.employeeId;
    if (!approverId) throw new ForbiddenException('Invalid session');
    return this.leaveService.approveLeave(id, approverId);
  }

  @RequirePermissions(RbacPermissions.LEAVE_REJECT)
  @Post(':id/reject')
  rejectLeave(@Param('id') id: string, @CurrentUser() user: any, @Body('reason') reason: string): Promise<unknown> {
    const approverId = user?.employeeId;
    if (!approverId) throw new ForbiddenException('Invalid session');
    return this.leaveService.rejectLeave(id, approverId, reason || 'No reason provided');
  }

  @RequirePermissions(RbacPermissions.LEAVE_CREATE)
  @Post(':id/cancel')
  cancelLeave(@Param('id') id: string, @CurrentUser() user: any): Promise<unknown> {
    const employeeId = user?.employeeId;
    if (!employeeId) {
      throw new ForbiddenException('You can only cancel your own leaves.');
    }
    return this.leaveService.cancelLeave(id, employeeId);
  }

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Get('calendar')
  getCalendar(@CurrentUser() user: any): Promise<unknown> {
    // Always use the authenticated user's own ID from the JWT
    return this.leaveService.getCalendar(user.employeeId, user.role);
  }

}
