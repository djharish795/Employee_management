import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SuccessionService } from './succession.service';
import { CreateSuccessionPlanDto, UpdateSuccessionPlanDto, Permission } from '@naprocs/types';
import { SuccessionPlan } from '@naprocs/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresPhase } from '../../common/decorators/requires-phase.decorator';

@Controller('succession')
@RequiresPhase(2)
@UseGuards(JwtAuthGuard, RbacGuard)
export class SuccessionController {
  constructor(private readonly successionService: SuccessionService) {}

  @RequirePermissions(RbacPermissions.TALENT_READ)
  @Get()
  @Permissions(Permission.READ_EMPLOYEES)
  findAll() {
    return this.successionService.findAll();
  }

  @Post()
  @Permissions(Permission.WRITE_EMPLOYEES)
  create(@Body() createSuccessionDto: CreateSuccessionPlanDto): Promise<SuccessionPlan> {
    return this.successionService.create(createSuccessionDto);
  }

  @Patch(':id')
  @Permissions(Permission.WRITE_EMPLOYEES)
  update(@Param('id') id: string, @Body() updateSuccessionDto: UpdateSuccessionPlanDto): Promise<SuccessionPlan> {
    return this.successionService.update(id, updateSuccessionDto);
  }

  @Delete(':id')
  @Permissions(Permission.WRITE_EMPLOYEES)
  remove(@Param('id') id: string) {
    return this.successionService.remove(id);
  }

  @Post('transfer-ceo')
  @Permissions(Permission.WRITE_EMPLOYEES)
  transferCeo(@Body() body: { newCeoEmployeeId: string }, @CurrentUser() user: any) {
    return this.successionService.transferCEO(body.newCeoEmployeeId, user.employeeId);
  }
}