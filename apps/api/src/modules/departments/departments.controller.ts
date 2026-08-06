import { Controller, Get, Query, UseGuards, UseInterceptors } from "@nestjs/common";
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

  @Get()
  @Permissions(Permission.READ_EMPLOYEES) // Required since it's used in employee forms
  async getDepartments(
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    return this.departmentsService.getDepartments(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 100
    );
  }

  @Get('all-designations')
  @Permissions(Permission.READ_EMPLOYEES)
  async getAllDesignations() {
    return this.departmentsService.getAllDesignations();
  }

  @RequirePermissions(RbacPermissions.DEPARTMENTS_READ)
  @Get("dashboard")
  @Permissions(Permission.READ_EMPLOYEES) // Restrict to roles that can view org structure
  async getDashboardStats() {
    return this.departmentsService.getDashboardStats();
  }
}
