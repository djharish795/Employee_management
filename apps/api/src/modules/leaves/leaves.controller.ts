import { Controller, Get, Post, Body, Param, Req, UseGuards, Query } from '@nestjs/common';
import { ApplyLeaveDto } from './dto/apply-leave.dto';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('leaves')
@UseGuards(JwtAuthGuard)
export class LeavesController {

  constructor(private readonly leaveService: LeavesService) {}

  @Get('kpi')
  getLeavesKPI(@Query('employeeId') employeeId: string): Promise<unknown> {
    return this.leaveService.getLeavesKPI(employeeId);
  }

  @Get('approvals/:approverId')
  getApprovals(@Param('approverId') approverId: string): Promise<unknown> {
    return this.leaveService.getApprovals(approverId);
  }

  @Get('my')
  getMyLeaves(@Req() req: any): Promise<unknown> {
    // Assuming JwtAuthGuard adds user info to req.user
    const employeeId = req.user?.id || req.query.employeeId;
    return this.leaveService.getMyLeaves(employeeId);
  }

  @Post('apply')
  applyLeave(@Body() data: ApplyLeaveDto): Promise<unknown> {
    return this.leaveService.applyLeave(data);
  }

  @Post('calculate')
  calculateLeave(@Body() data: ApplyLeaveDto): Promise<unknown> {
    return this.leaveService.calculateLeave(data);
  }

  @Post(':id/approve')
  approveLeave(@Param('id') id: string, @Body('approverId') approverId: string): Promise<unknown> {
    return this.leaveService.approveLeave(id, approverId);
  }

  @Post(':id/reject')
  rejectLeave(@Param('id') id: string, @Body('approverId') approverId: string, @Body('reason') reason: string): Promise<unknown> {
    return this.leaveService.rejectLeave(id, approverId, reason || 'No reason provided');
  }

  @Post('admin/accrue-monthly')
  accrueMonthlyLeaves(): Promise<unknown> {
    return this.leaveService.accrueMonthlyLeaves();
  }

  @Get('calendar')
  getCalendar(): Promise<unknown> {
    return this.leaveService.getCalendar();
  }

  @Get('debug-leaves')
  async debugLeaves(): Promise<unknown> {
    return this.leaveService['prisma'].leaveRequest.findMany({ include: { employee: true } });
  }


}
