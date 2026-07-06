import { Controller, Post, Body, Get, Query, Param, Patch } from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { OnboardingDraftStepDto } from "./dto/onboarding-step.dto";
import { PaginationParams, PaginatedResult } from "../../common/utils/pagination.util";
import { Employee } from "@naprocs/database";
import { UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { AuditInterceptor } from "../../common/interceptors/audit.interceptor";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("employees")
@UseGuards(JwtAuthGuard, RbacGuard)
@UseInterceptors(AuditInterceptor)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Post("onboarding/draft/step")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async saveOnboardingStep(@Body() body: OnboardingDraftStepDto) {
    return this.employeesService.saveOnboardingStep(body.draftId || "", body.stepNumber, body.payload);
  }

  @Post("onboarding/draft/complete")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async completeOnboarding(@Body() body: { draftId: string }): Promise<Employee> {
    return this.employeesService.completeOnboarding(body.draftId);
  }

  @Post()
  @Permissions(Permission.WRITE_EMPLOYEES)
  createEmployee(@Body() dto: CreateEmployeeDto): Promise<Employee> {
    return this.employeesService.createEmployee(dto);
  }

  @Get("org-chart")
  // Using READ_OWN_PROFILE since all users should have access to the public directory
  @Permissions(Permission.READ_OWN_PROFILE, Permission.READ_EMPLOYEES)
  getOrgChart(): Promise<any> {
    return this.employeesService.getOrgChart();
  }

  @Post("org-chart/reassign")
  @Permissions(Permission.WRITE_EMPLOYEES) // Requires HR/CEO permission to update structure
  async reassignManager(@Body() body: { employeeId: string; newManagerId: string }) {
    await this.employeesService.reassignManager(body.employeeId, body.newManagerId);
    return { success: true };
  }

  @Get("org-stats")
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_TEAM_PROFILES)
  getOrgStats() {
    return this.employeesService.getOrgStats();
  }

  @Get()
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_TEAM_PROFILES)
  getEmployees(@Query() params: PaginationParams): Promise<PaginatedResult<Employee>> {
    return this.employeesService.getEmployees(params);
  }

  @Get("cto-team")
  getCtoTeam(): Promise<any> {
    return this.employeesService.getCtoTeam();
  }

  @Get(":id")
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_TEAM_PROFILES, Permission.READ_OWN_PROFILE)
  getEmployeeById(@Param("id") id: string, @CurrentUser() user: any): Promise<Employee> {
    return this.employeesService.getEmployeeById(id, user);
  }

  @Patch(":id")
  @Permissions(Permission.WRITE_EMPLOYEES, Permission.WRITE_OWN_PROFILE)
  updateEmployee(@Param("id") id: string, @Body() dto: UpdateEmployeeDto, @CurrentUser() user: any): Promise<Employee> {
    return this.employeesService.updateEmployee(id, dto, user);
  }
}

