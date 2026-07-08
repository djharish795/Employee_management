import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InAppNotificationService } from './in-app.service';
import { NotificationType } from '@naprocs/database';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inAppService: InAppNotificationService
  ) {}

  async getNotifications(employeeId: string): Promise<any> {
    if (!employeeId) throw new BadRequestException('Employee ID is required');

    return this.prisma.notification.findMany({
      where: { recipientId: employeeId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to latest 50 notifications
    });
  }

  async markAsRead(employeeId: string, id: string): Promise<any> {
    if (!employeeId || !id) throw new BadRequestException('Missing parameters');

    return this.prisma.notification.update({
      where: { id, recipientId: employeeId },
      data: { isRead: true, readAt: new Date() }
    });
  }

  async markAllAsRead(employeeId: string): Promise<any> {
    if (!employeeId) throw new BadRequestException('Employee ID is required');

    return this.prisma.notification.updateMany({
      where: { recipientId: employeeId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });
  }

  async createNotification(employeeId: string, title: string, body: string, type: NotificationType): Promise<any> {
    const notification = await this.prisma.notification.create({
      data: {
        recipientId: employeeId,
        title,
        body,
        type,
        isRead: false
      }
    });

    // Fire realtime websocket event
    this.inAppService.emitNotification(employeeId, notification);

    return notification;
  }
}
