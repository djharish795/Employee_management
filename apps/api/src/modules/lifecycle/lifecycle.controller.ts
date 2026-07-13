import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, UseInterceptors } from "@nestjs/common";
import { OffboardingService } from "./offboarding.service";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';
import { 
  initiateOffboardingSchema, 
  updateOffboardingSchema, 
  updateChecklistItemSchema, 
  recordInterviewSchema,
  cancelOffboardingSchema
} from "@naprocs/schemas";
import { GetOffboardingQueryDto } from "./dto/get-offboarding-query.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuditInterceptor } from "../../common/interceptors/audit.interceptor";

@Controller("lifecycle/offboarding")
@UseGuards(JwtAuthGuard, RbacGuard)
@UseInterceptors(AuditInterceptor)
export class LifecycleController {
  constructor(private readonly offboardingService: OffboardingService) {}

  @RequirePermissions(RbacPermissions.EMPLOYEES_UPDATE)
  @Post()
  @Permissions(Permission.WRITE_EMPLOYEES)
  async initiate(
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(initiateOffboardingSchema)) dto: any
  ): Promise<any> {
    return this.offboardingService.initiate(dto, user?.employeeId);
  }

  @Get()
  @Permissions(Permission.READ_EMPLOYEES)
  async findAll(@Query() query: GetOffboardingQueryDto): Promise<any> {
    return this.offboardingService.findAll(query);
  }

  @Get(":id")
  @Permissions(Permission.READ_EMPLOYEES)
  async findOne(@Param("id") id: string): Promise<any> {
    return this.offboardingService.findOne(id);
  }

  @Patch(":id")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async update(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(updateOffboardingSchema)) dto: any
  ): Promise<any> {
    return this.offboardingService.update(id, dto, user?.employeeId);
  }

  @Patch(":id/checklist-item")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async updateChecklistItem(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(updateChecklistItemSchema)) dto: any
  ): Promise<any> {
    return this.offboardingService.updateChecklistItem(id, dto, user?.employeeId);
  }

  @Post(":id/interview")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async recordInterview(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(recordInterviewSchema)) dto: any
  ): Promise<any> {
    return this.offboardingService.recordInterview(id, dto, user?.employeeId);
  }

  @Post(":id/cancel")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async cancel(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body(new ZodValidationPipe(cancelOffboardingSchema)) dto: any
  ): Promise<any> {
    return this.offboardingService.cancel(id, dto.reason, user?.employeeId);
  }
}
