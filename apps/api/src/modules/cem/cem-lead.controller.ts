import { Controller, Get, Post, Put, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { CemLeadService } from './cem-lead.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';
import { CreateCemLeadDto } from './dto/create-cem-lead.dto';
import { BantUpdateDto } from './dto/bant-update.dto';
import { AddFollowUpLogDto } from './dto/add-follow-up-log.dto';
import { AddMeetingLogDto } from './dto/add-meeting-log.dto';

@Controller('cem/leads')
@UseGuards(JwtAuthGuard, RbacGuard)
export class CemLeadController {
  constructor(private readonly service: CemLeadService) {}

  @Get()
  @Permissions(Permission.ACCESS_CEM)
  async getAllLeads(@Query('priority') priority: string, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.getAllLeads(actorId, priority);
  }

  @Get('pipeline')
  @Permissions(Permission.ACCESS_CEM)
  async getPipelineLeads() {
    return this.service.getPipelineLeads();
  }

  @Get('dashboard-summary')
  @Permissions(Permission.ACCESS_CEM)
  async getDashboardSummary() {
    return this.service.getDashboardSummary();
  }

  @Get(':id')
  @Permissions(Permission.ACCESS_CEM)
  async getLeadById(@Param('id') id: string) {
    return this.service.getLeadById(id);
  }

  @Post()
  @Permissions(Permission.ACCESS_CEM)
  async createLead(@Body() dto: CreateCemLeadDto, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.createLead(dto, actorId);
  }

  @Put(':id/stage')
  @Permissions(Permission.ACCESS_CEM)
  async updateStage(@Param('id') id: string, @Body() body: { stage: number }) {
    return this.service.updateStage(id, body.stage);
  }

  @Put(':id/bant')
  @Permissions(Permission.ACCESS_CEM)
  async toggleBant(@Param('id') id: string, @Body() dto: BantUpdateDto) {
    return this.service.toggleBant(id, dto);
  }

  @Post(':id/follow-ups')
  @Permissions(Permission.ACCESS_CEM)
  async addFollowUpLog(@Param('id') id: string, @Body() dto: AddFollowUpLogDto) {
    return this.service.addFollowUpLog(id, dto);
  }

  @Post(':id/meetings')
  @Permissions(Permission.ACCESS_CEM)
  async addMeetingLog(@Param('id') id: string, @Body() dto: AddMeetingLogDto) {
    return this.service.addMeetingLog(id, dto);
  }

  @Post(':id/handoff')
  @Permissions(Permission.ACCESS_CEM)
  async triggerHandoff(@Param('id') id: string, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.triggerHandoff(id, actorId);
  }

  @Put(':id/status')
  @Permissions(Permission.ACCESS_CEM)
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateStatus(id, body.status);
  }


  @Post(':id/confirm-handoff')
  @Permissions(Permission.ACCESS_CEM)
  async confirmHandoff(@Param('id') id: string, @Body() body: { crmOwner: string }) {
    return this.service.confirmHandoff(id, body.crmOwner);
  }
}
