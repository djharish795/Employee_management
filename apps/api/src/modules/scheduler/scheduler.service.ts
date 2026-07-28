import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertDailyLogDto } from './dto/upsert-daily-log.dto';

function parseDateOnly(dateStr: string): Date {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new BadRequestException(`Invalid date: ${dateStr}`);
  }
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

@Injectable()
export class SchedulerService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertDailyLog(employeeId: string, dateStr: string, dto: UpsertDailyLogDto) {
    const date = parseDateOnly(dateStr);

    return this.prisma.dailyWorkLog.upsert({
      where: { employeeId_date: { employeeId, date } },
      create: {
        employeeId,
        date,
        summary: dto.summary,
        tasksDone: dto.tasksDone || [],
        hoursLogged: dto.hoursLogged,
      },
      update: {
        summary: dto.summary,
        tasksDone: dto.tasksDone || [],
        hoursLogged: dto.hoursLogged,
      },
    });
  }

  async getMyLogs(employeeId: string, startDateStr?: string, endDateStr?: string) {
    const endDate = endDateStr ? parseDateOnly(endDateStr) : (() => {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      return d;
    })();

    const startDate = startDateStr ? parseDateOnly(startDateStr) : (() => {
      const d = new Date(endDate);
      d.setUTCDate(d.getUTCDate() - 30);
      return d;
    })();

    return this.prisma.dailyWorkLog.findMany({
      where: {
        employeeId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    });
  }
}
