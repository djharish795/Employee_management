import { Controller, Post, Body, Get, Query, Param, Patch } from "@nestjs/common";
import { DepartmentsService } from "./departments.service";
import { CreateDepartmentDto } from "./dto/create-department.dto";
import { UpdateDepartmentDto } from "./dto/update-department.dto";
import { PaginationParams, PaginatedResult } from "../../common/utils/pagination.util";
import { Department } from "@naprocs/database";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller("departments")
@UseGuards(JwtAuthGuard, RbacGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @RequirePermissions(RbacPermissions.DEPARTMENTS_CREATE)
  @Post()
  createDepartment(@Body() dto: CreateDepartmentDto): Promise<Department> {
    return this.departmentsService.createDepartment(dto);
  }

  @RequirePermissions(RbacPermissions.DEPARTMENTS_READ)
  @Get()
  getDepartments(@Query() params: PaginationParams): Promise<PaginatedResult<Department>> {
    return this.departmentsService.getDepartments(params);
  }

  @RequirePermissions(RbacPermissions.DESIGNATIONS_READ)
  @Get("all-designations")
  getDesignations() {
    return this.departmentsService.getDesignations();
  }

  @RequirePermissions(RbacPermissions.DEPARTMENTS_READ)
  @Get("dashboard")
  @Permissions(Permission.READ_EMPLOYEES)
  getDashboardStats() {
    return this.departmentsService.getOrganisationDashboardStats();
  }

  @Get(":id")
  getDepartmentById(@Param("id") id: string): Promise<Department> {
    return this.departmentsService.getDepartmentById(id);
  }

  @RequirePermissions(RbacPermissions.DEPARTMENTS_UPDATE)
  @Patch(":id")
  updateDepartment(@Param("id") id: string, @Body() dto: UpdateDepartmentDto): Promise<Department> {
    return this.departmentsService.updateDepartment(id, dto);
  }
}
