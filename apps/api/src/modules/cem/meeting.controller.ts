import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { MeetingService } from './meeting.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Controller('cem/meetings')
@UseGuards(JwtAuthGuard, RbacGuard)
export class MeetingController {
  constructor(private readonly service: MeetingService) {}

  @Get()
  @Permissions(Permission.ACCESS_CEM)
  async getMeetings(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('employee') employee?: string,
    @Query('date') date?: string
  ) {
    return this.service.getMeetings({ status, type, employee, date });
  }

  @Post()
  @Permissions(Permission.ACCESS_CEM)
  async createMeeting(@Body() dto: CreateMeetingDto, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.createMeeting(dto, actorId);
  }

  @Put(':id')
  @Permissions(Permission.ACCESS_CEM)
  async updateMeeting(@Param('id') id: string, @Body() dto: UpdateMeetingDto, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.updateMeeting(id, dto, actorId);
  }

  @Delete(':id')
  @Permissions(Permission.ACCESS_CEM)
  async deleteMeeting(@Param('id') id: string, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.deleteMeeting(id, actorId);
  }
}
