import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { InAppNotificationService } from './in-app.service';
import { EmailService } from './email.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, InAppNotificationService, EmailService],
  exports: [NotificationsService, InAppNotificationService, EmailService],
})
export class NotificationsModule {}
