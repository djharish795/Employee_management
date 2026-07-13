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

@Controller("departments")
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  createDepartment(@Body() dto: CreateDepartmentDto): Promise<Department> {
    return this.departmentsService.createDepartment(dto);
  }

  @Get()
  getDepartments(@Query() params: PaginationParams): Promise<PaginatedResult<Department>> {
    return this.departmentsService.getDepartments(params);
  }

  @Get("all-designations")
  getDesignations() {
    return this.departmentsService.getDesignations();
  }

  @Get("dashboard")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @Permissions(Permission.READ_EMPLOYEES)
  getDashboardStats() {
    return this.departmentsService.getOrganisationDashboardStats();
  }

  @Get(":id")
  getDepartmentById(@Param("id") id: string): Promise<Department> {
    return this.departmentsService.getDepartmentById(id);
  }

  @Patch(":id")
  updateDepartment(@Param("id") id: string, @Body() dto: UpdateDepartmentDto): Promise<Department> {
    return this.departmentsService.updateDepartment(id, dto);
  }
}
