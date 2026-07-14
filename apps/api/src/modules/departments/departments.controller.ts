import { Controller, Get, UseGuards, UseInterceptors } from "@nestjs/common";
import { DepartmentsService } from "./departments.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { AuditInterceptor } from "../../common/interceptors/audit.interceptor";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller("departments")
@UseGuards(JwtAuthGuard, RbacGuard)
@UseInterceptors(AuditInterceptor)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @RequirePermissions(RbacPermissions.DEPARTMENTS_READ)
  @Get("dashboard")
  @Permissions(Permission.READ_EMPLOYEES) // Restrict to roles that can view org structure
  async getDashboardStats() {
    return this.departmentsService.getDashboardStats();
  }
}
