import { Controller, Get, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { EmployeeFilterDto } from "./dto/employee-params.dto";
import { PaginatedResult } from "../../common/utils/pagination.util";
import { EmployeeResponseDto } from "./dto/employee-response.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { AuditInterceptor } from "../../common/interceptors/audit.interceptor";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("team")
@UseGuards(JwtAuthGuard, RbacGuard)
@UseInterceptors(AuditInterceptor)
export class TeamController {
  constructor(private readonly employeesService: EmployeesService) {}

  @RequirePermissions(RbacPermissions.EMPLOYEES_READ)
  @Get()
  @Permissions(Permission.READ_EMPLOYEES, Permission.READ_TEAM_PROFILES, Permission.READ_OWN_PROFILE)
  getTeam(@Query() params: EmployeeFilterDto, @CurrentUser() user: any): Promise<PaginatedResult<EmployeeResponseDto>> {
    return this.employeesService.getEmployees(params, user);
  }
}
