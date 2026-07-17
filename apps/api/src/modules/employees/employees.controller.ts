import { Controller, Post, Body, Get, Query, Param, Patch, Delete, Ip } from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { OnboardingDraftStepDto } from "./dto/onboarding-step.dto";
import { EmployeeIdParamDto, ReassignManagerDto, CompleteOnboardingDto, EmployeeFilterDto } from "./dto/employee-params.dto";
import { PaginationParams, PaginatedResult } from "../../common/utils/pagination.util";
import { EmployeeResponseDto } from "./dto/employee-response.dto";
import { UseGuards, UseInterceptors } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { AuditInterceptor } from "../../common/interceptors/audit.interceptor";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller("employees")
@UseGuards(JwtAuthGuard, RbacGuard)
@UseInterceptors(AuditInterceptor)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @RequirePermissions(RbacPermissions.EMPLOYEES_UPDATE)
  @Post("onboarding/draft/step")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async saveOnboardingStep(@Body() body: OnboardingDraftStepDto) {
    return this.employeesService.saveOnboardingStep(body.draftId || "", body.stepNumber, body.payload);
  }

  @Get("onboarding/draft/:id")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async getOnboardingDraft(@Param() params: EmployeeIdParamDto) {
    return this.employeesService.getOnboardingDraft(params.id);
  }

  @Post("onboarding/draft/complete")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async completeOnboarding(
    @Body() body: CompleteOnboardingDto,
    @CurrentUser() user: any,
    @Ip() ip: string
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.completeOnboarding(body.draftId, user, ip);
  }

  @Post()
  @Permissions(Permission.WRITE_EMPLOYEES)
  createEmployee(@Body() dto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    return this.employeesService.createEmployee(dto);
  }

  @Get("org-chart")
  // Using READ_OWN_PROFILE since all users should have access to the public directory
  @Permissions(Permission.READ_OWN_PROFILE, Permission.READ_EMPLOYEES)
  getOrgChart(): Promise<any> {
    return this.employeesService.getOrgChart();
  }

  @Get("search-directory")
  @Permissions(Permission.READ_OWN_PROFILE, Permission.READ_EMPLOYEES)
  searchDirectory(@Query("q") query: string): Promise<any> {
    return this.employeesService.searchDirectory(query);
  }

  @Post("org-chart/reassign")
  @Permissions(Permission.WRITE_EMPLOYEES) // Requires HR/CEO permission to update structure
  async reassignManager(@Body() body: ReassignManagerDto) {
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
  getEmployees(@Query() params: EmployeeFilterDto): Promise<PaginatedResult<EmployeeResponseDto>> {
    return this.employeesService.getEmployees(params);
  }

  @Get("cto-team")
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_TEAM_PROFILES)
  getCtoTeam(): Promise<any> {
    return this.employeesService.getCtoTeam();
  }

  @Get(":id")
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_TEAM_PROFILES, Permission.READ_OWN_PROFILE)
  getEmployeeById(@Param() params: EmployeeIdParamDto, @CurrentUser() user: any): Promise<EmployeeResponseDto> {
    return this.employeesService.getEmployeeById(params.id, user);
  }

  @Patch(":id")
  @Permissions(Permission.WRITE_EMPLOYEES, Permission.WRITE_OWN_PROFILE)
  updateEmployee(@Param() params: EmployeeIdParamDto, @Body() dto: UpdateEmployeeDto, @CurrentUser() user: any): Promise<EmployeeResponseDto> {
    return this.employeesService.updateEmployee(params.id, dto, user);
  }

  @Delete(":id")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async deleteEmployee(@Param() params: EmployeeIdParamDto): Promise<{ success: boolean }> {
    await this.employeesService.deleteEmployee(params.id);
    return { success: true };
  }
}

