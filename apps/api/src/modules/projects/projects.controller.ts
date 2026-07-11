import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectRole } from '@naprocs/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';
import { RequiresPhase } from '../../common/decorators/requires-phase.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Request as ExpressRequest } from 'express';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CompleteProjectDto {
  @IsString()
  signatureName!: string;
}

export class AssignMemberDto {
  @IsString()
  employeeId!: string;

  @IsEnum(ProjectRole)
  projectRole!: ProjectRole;
}

export class ReleaseMemberDto {
  @IsString()
  employeeId!: string;
}

@Controller('projects')
@UseGuards(JwtAuthGuard, RbacGuard)
@RequiresPhase(1)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Permissions(Permission.MANAGE_PROJECTS)
  createProject(@Body() data: CreateProjectDto) {
    return this.projectsService.createProject(data);
  }

  @Get()
  @Permissions(Permission.READ_OWN_PROFILE)
  getAllProjects(@CurrentUser() user: any) {
    return this.projectsService.getAllProjects(user);
  }

  @Get(':id')
  @Permissions(Permission.READ_OWN_PROFILE)
  getProjectDetails(@Param('id') id: string) {
    return this.projectsService.getProjectDetails(id);
  }

  @Patch(':id/complete')
  @Permissions(Permission.MANAGE_PROJECTS)
  completeProject(@Param('id') id: string, @Body() data: CompleteProjectDto) {
    return this.projectsService.completeProject(id, data.signatureName);
  }

  @Post(':id/delete')
  @Permissions(Permission.MANAGE_PROJECTS)
  deleteProject(@Param('id') id: string) {
    return this.projectsService.deleteProject(id);
  }

  @Post(':id/assign')
  @Permissions(Permission.READ_OWN_PROFILE)
  assignMember(
    @Param('id') id: string,
    @Body() data: AssignMemberDto,
    @CurrentUser() user: any
  ) {
    return this.projectsService.assignMember(id, data.employeeId, data.projectRole, user);
  }

  @Post(':id/release')
  @Permissions(Permission.READ_OWN_PROFILE)
  releaseMember(
    @Param('id') id: string,
    @Body() data: ReleaseMemberDto,
    @CurrentUser() user: any
  ) {
    return this.projectsService.releaseMember(id, data.employeeId, user);
  }

  @Post(':id/sprints')
  @Permissions(Permission.WRITE_OWN_PROFILE)
  createSprint(@Param('id') id: string, @Body() data: { name: string; startDate: string; endDate: string }) {
    return this.projectsService.createSprint(id, data);
  }

  @Get(':id/sprints')
  @Permissions(Permission.READ_OWN_PROFILE)
  getProjectSprints(@Param('id') id: string) {
    return this.projectsService.getProjectSprints(id);
  }

  @Patch('sprints/:sprintId')
  @Permissions(Permission.WRITE_OWN_PROFILE)
  updateSprint(@Param('sprintId') sprintId: string, @Body() data: any) {
    return this.projectsService.updateSprint(sprintId, data);
  }
}
