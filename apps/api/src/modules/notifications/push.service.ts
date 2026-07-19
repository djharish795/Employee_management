import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendPushNotification(employeeId: string, title: string, body: string, data?: any) {
    const policy = await this.prisma.orgPolicy.findFirst();
    
    if (policy && !policy.pushNotificationsEnabled) {
      this.logger.debug(`Push notification to ${employeeId} blocked by OrgPolicy.`);
      return;
    }

    // TODO: Implement Firebase Admin SDK integration here
    this.logger.log(`[MOCK PUSH NOTIFICATION] To: ${employeeId} | Title: ${title} | Body: ${body}`);
  }
}
