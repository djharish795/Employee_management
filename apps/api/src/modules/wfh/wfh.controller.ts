import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { WfhService } from './wfh.service';
import { ApplyWfhDto } from './dto/apply-wfh.dto';

@Controller('wfh')
export class WfhController {
  constructor(private readonly wfhService: WfhService) {}

  @Get('my')
  getMyWfh(@Query('employeeId') employeeId: string): Promise<unknown> {
    return this.wfhService.getMyWfh(employeeId);
  }

  @Get('approvals')
  getApprovals(@Query('approverId') approverId: string): Promise<unknown> {
    return this.wfhService.getApprovals(approverId);
  }

  @Post('apply')
  applyWfh(@Body() data: ApplyWfhDto): Promise<unknown> {
    return this.wfhService.applyWfh(data.employeeId, data.date, data.reason);
  }

  @Post(':id/approve')
  approveWfh(@Param('id') id: string, @Body('approverId') approverId: string): Promise<unknown> {
    return this.wfhService.approveWfh(id, approverId);
  }

  @Post(':id/reject')
  rejectWfh(@Param('id') id: string, @Body('approverId') approverId: string, @Body('reason') reason: string): Promise<unknown> {
    return this.wfhService.rejectWfh(id, approverId, reason || 'No reason provided');
  }
}
