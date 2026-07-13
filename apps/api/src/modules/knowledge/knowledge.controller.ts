import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';
import { KnowledgeService } from "./knowledge.service";
import { CreateKnowledgeDocDto } from "./dto/create-knowledge.dto";
import { UpdateKnowledgeDocDto } from "./dto/update-knowledge.dto";
import { SearchKnowledgeDocDto } from "./dto/search-knowledge.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission, UserRole } from "@naprocs/types";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuditInterceptor } from "../../common/interceptors/audit.interceptor";

@Controller("knowledge")
@UseGuards(JwtAuthGuard, RbacGuard)
@UseInterceptors(AuditInterceptor)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) { }

  @RequirePermissions(RbacPermissions.KNOWLEDGE_CREATE)
  @Post()
  @Permissions(Permission.WRITE_EMPLOYEES)
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateKnowledgeDocDto,
  ) {
    return this.knowledgeService.create(user, dto);
  }

  @Get()
  @Permissions(Permission.READ_OWN_PROFILE)
  async findAll(
    @CurrentUser() user: any,
    @Query() query: SearchKnowledgeDocDto,
  ) {
    return this.knowledgeService.list(user.role as UserRole, query);
  }

  @Get("id/:id")
  @Permissions(Permission.READ_OWN_PROFILE)
  async findOne(
    @Param("id") id: string,
    @CurrentUser() user: any,
  ) {
    return this.knowledgeService.findOne(id, user.role as UserRole);
  }

  @Get("slug/:slug")
  @Permissions(Permission.READ_OWN_PROFILE)
  async findBySlug(
    @Param("slug") slug: string,
    @CurrentUser() user: any,
  ) {
    return this.knowledgeService.findBySlug(slug, user.role as UserRole);
  }

  @Patch(":id")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async update(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateKnowledgeDocDto,
  ) {
    return this.knowledgeService.update(id, user.role as UserRole, dto);
  }

  @Delete(":id")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: any,
  ) {
    return this.knowledgeService.remove(id, user.role as UserRole);
  }

  @Patch(":id/publish")
  @Permissions(Permission.WRITE_EMPLOYEES)
  async publish(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body("isPublished") isPublished: boolean,
  ) {
    return this.knowledgeService.publish(id, user.role as UserRole, isPublished);
  }

  @Post(":id/acknowledge")
  @Permissions(Permission.READ_OWN_PROFILE)
  async acknowledge(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Body("signatureName") signatureName: string,
  ) {
    return this.knowledgeService.acknowledge(id, user.employeeId, signatureName);
  }
}
