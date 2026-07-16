import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller("audit")
@UseGuards(JwtAuthGuard, RbacGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) { }

  @RequirePermissions(RbacPermissions.AUDIT_READ)
  @Get("events")
  @Permissions(Permission.READ_AUDIT)
  async getRecentEvents(@Query("limit") limit?: string, @Query("offset") offset?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    return this.auditService.getRecentEvents(parsedLimit, parsedOffset);
  }

  @Get("metrics")
  @Permissions(Permission.READ_AUDIT)
  async getMetrics() {
    return this.auditService.getMetrics24h();
  }
}
