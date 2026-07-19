import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RbacRoles } from '../../common/rbac/rbac.config';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);
  
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkDeadlines() {
    this.logger.log('Running deadline tracking cron...');
    const upcoming = await this.prisma.statutoryFiling.findMany({
      where: { 
        status: 'PENDING', 
        deadline: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } 
      }
    });

    const ceos = await this.prisma.user.findMany({
      where: { role: RbacRoles.CEO },
      select: { employeeId: true }
    });

    for (const filing of upcoming) {
      for (const ceo of ceos) {
        if (ceo.employeeId) {
          await this.notificationsService.createNotification(
            ceo.employeeId,
            `Upcoming Deadline: ${filing.title}`,
            `The statutory filing for ${filing.title} is due on ${filing.deadline.toISOString().split('T')[0]}.`,
            'SYSTEM_ALERT',
            filing.id
          );
        }
      }
    }
  }
}
