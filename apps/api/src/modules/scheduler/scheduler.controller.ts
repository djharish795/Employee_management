import { Controller, Get, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { UpsertDailyLogDto } from './dto/upsert-daily-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';

@Controller('scheduler')
@UseGuards(JwtAuthGuard, RbacGuard)
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Put(':date')
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async upsertDailyLog(
    @Param('date') date: string,
    @Body() dto: UpsertDailyLogDto,
    @Req() req: any,
  ) {
    const employeeId = req.user?.employeeId;
    return this.schedulerService.upsertDailyLog(employeeId, date, dto);
  }

  @Get()
  @Permissions(Permission.READ_OWN_PROFILE)
  async getMyLogs(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    const employeeId = req.user?.employeeId;
    return this.schedulerService.getMyLogs(employeeId, startDate, endDate);
  }
}
