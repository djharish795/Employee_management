import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { WfhService } from './wfh.service';
import { ApplyWfhDto } from './dto/apply-wfh.dto';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller('wfh')
export class WfhController {
  constructor(private readonly wfhService: WfhService) {}

  @RequirePermissions(RbacPermissions.WFH_READ)
  @Get('my')
  getMyWfh(@Query('employeeId') employeeId: string): Promise<unknown> {
    return this.wfhService.getMyWfh(employeeId);
  }

  @RequirePermissions(RbacPermissions.WFH_READ)
  @Get('approvals')
  getApprovals(@Query('approverId') approverId: string): Promise<unknown> {
    return this.wfhService.getApprovals(approverId);
  }

  @RequirePermissions(RbacPermissions.WFH_CREATE)
  @Post('apply')
  applyWfh(@Body() data: ApplyWfhDto): Promise<unknown> {
    return this.wfhService.applyWfh(data.employeeId, data.date, data.reason);
  }

  @RequirePermissions(RbacPermissions.WFH_APPROVE)
  @Post(':id/approve')
  approveWfh(@Param('id') id: string, @Body('approverId') approverId: string): Promise<unknown> {
    return this.wfhService.approveWfh(id, approverId);
  }

  @RequirePermissions(RbacPermissions.WFH_REJECT)
  @Post(':id/reject')
  rejectWfh(@Param('id') id: string, @Body('approverId') approverId: string, @Body('reason') reason: string): Promise<unknown> {
    return this.wfhService.rejectWfh(id, approverId, reason || 'No reason provided');
  }
}
