import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SuccessionService } from './succession.service';
import { CreateSuccessionPlanDto, UpdateSuccessionPlanDto, Permission } from '@naprocs/types';
import { SuccessionPlan } from '@naprocs/database';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('succession')
@UseGuards(JwtAuthGuard, RbacGuard)
export class SuccessionController {
  constructor(private readonly successionService: SuccessionService) {}

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
}