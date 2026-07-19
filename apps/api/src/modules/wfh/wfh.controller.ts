import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WfhService } from './wfh.service';
import { ApplyWfhDto } from './dto/apply-wfh.dto';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// SECURITY: Every endpoint is guarded by JWT auth and RBAC.
// employeeId and approverId are ALWAYS derived from the verified JWT payload
// via @CurrentUser() — never from query strings or request bodies.
// This prevents intra-role data leakage (Employee A reading Employee B data).
@Controller('wfh')
@UseGuards(JwtAuthGuard, RbacGuard)
export class WfhController {
  constructor(private readonly wfhService: WfhService) {}

  @RequirePermissions(RbacPermissions.WFH_READ)
  @Get('my')
  @Permissions(Permission.READ_OWN_PROFILE)
  getMyWfh(@CurrentUser() user: any): Promise<unknown> {
    // employeeId comes from the verified JWT — not the query string
    return this.wfhService.getMyWfh(user.employeeId);
  }

  @RequirePermissions(RbacPermissions.WFH_READ)
  @Get('approvals')
  @Permissions(Permission.READ_TEAM_PROFILES)
  getApprovals(@CurrentUser() user: any): Promise<unknown> {
    // approverId comes from the verified JWT — not a spoofable query param
    return this.wfhService.getApprovals(user.employeeId);
  }

  @RequirePermissions(RbacPermissions.WFH_CREATE)
  @Post('apply')
  @Permissions(Permission.WRITE_OWN_PROFILE)
  applyWfh(@CurrentUser() user: any, @Body() data: ApplyWfhDto): Promise<unknown> {
    // Override any employeeId in the body with the authenticated user's own ID
    return this.wfhService.applyWfh(user.employeeId, data.date, data.reason);
  }

  @RequirePermissions(RbacPermissions.WFH_APPROVE)
  @Post(':id/approve')
  @Permissions(Permission.READ_TEAM_PROFILES)
  approveWfh(@Param('id') id: string, @CurrentUser() user: any): Promise<unknown> {
    // approverId from JWT — prevents approval spoofing
    return this.wfhService.approveWfh(id, user.employeeId);
  }

  @RequirePermissions(RbacPermissions.WFH_REJECT)
  @Post(':id/reject')
  @Permissions(Permission.READ_TEAM_PROFILES)
  rejectWfh(@Param('id') id: string, @CurrentUser() user: any, @Body('reason') reason: string): Promise<unknown> {
    // approverId from JWT — prevents rejection spoofing
    return this.wfhService.rejectWfh(id, user.employeeId, reason || 'No reason provided');
  }
}
