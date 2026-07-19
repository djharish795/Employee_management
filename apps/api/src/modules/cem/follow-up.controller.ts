import { Controller, Get, Post, Put, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { FollowUpService } from './follow-up.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpOutcomeDto } from './dto/update-follow-up-outcome.dto';

@Controller('cem/follow-ups')
@UseGuards(JwtAuthGuard, RbacGuard)
export class FollowUpController {
  constructor(private readonly service: FollowUpService) {}

  @Get()
  @Permissions(Permission.ACCESS_CEM)
  async getFollowUps(
    @Query('status') status?: string,
    @Query('stage') stage?: string
  ) {
    return this.service.getFollowUps({ status, stage });
  }

  @Get('summary')
  @Permissions(Permission.ACCESS_CEM)
  async getSummaryMetrics() {
    return this.service.getSummaryMetrics();
  }

  @Post()
  @Permissions(Permission.ACCESS_CEM)
  async createFollowUp(@Body() dto: CreateFollowUpDto, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.createFollowUp(dto, actorId);
  }

  @Put(':id/outcome')
  @Permissions(Permission.ACCESS_CEM)
  async logOutcome(@Param('id') id: string, @Body() dto: UpdateFollowUpOutcomeDto, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.logOutcome(id, dto, actorId);
  }
}
