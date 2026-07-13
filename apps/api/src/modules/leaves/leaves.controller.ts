import { Controller, Get, Post, Body, Param, Req, UseGuards, Query } from '@nestjs/common';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeavesController {

  constructor(private readonly leaveService: LeavesService) {}

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Get('kpi')
  getLeavesKPI(@Query('employeeId') employeeId: string): Promise<unknown> {
    return this.leaveService.getLeavesKPI(employeeId);
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
    const employeeId = req.user?.id || req.query.employeeId;
    return this.leaveService.getMyLeaves(employeeId);
  }

  @RequirePermissions(RbacPermissions.LEAVE_CREATE)
  @Post('apply')
  applyLeave(@Body() data: ApplyLeaveDto): Promise<unknown> {
    return this.leaveService.applyLeave(data);
  }

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Post('calculate')
  calculateLeave(@Body() data: ApplyLeaveDto): Promise<unknown> {
    return this.leaveService.calculateLeave(data);
  }

  @RequirePermissions(RbacPermissions.LEAVE_APPROVE)
  @Post(':id/approve')
  approveLeave(@Param('id') id: string, @Body('approverId') approverId: string): Promise<unknown> {
    return this.leaveService.approveLeave(id, approverId);
  }

  @RequirePermissions(RbacPermissions.LEAVE_REJECT)
  @Post(':id/reject')
  rejectLeave(@Param('id') id: string, @Body('approverId') approverId: string, @Body('reason') reason: string): Promise<unknown> {
    return this.leaveService.rejectLeave(id, approverId, reason || 'No reason provided');
  }

  @RequirePermissions(RbacPermissions.LEAVE_APPROVE)
  @Post('admin/accrue-monthly')
  accrueMonthlyLeaves(): Promise<unknown> {
    return this.leaveService.accrueMonthlyLeaves();
  }

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Get('calendar')
  getCalendar(): Promise<unknown> {
    return this.leaveService.getCalendar();
  }

  @RequirePermissions(RbacPermissions.LEAVE_READ)
  @Get('debug-leaves')
  async debugLeaves(): Promise<unknown> {
    return this.leaveService['prisma'].leaveRequest.findMany({ include: { employee: true } });
  }


}
