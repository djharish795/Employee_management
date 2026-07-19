import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { InAppNotificationService } from './in-app.service';
import { EmailService } from './email.service';
import { PushNotificationService } from './push.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, InAppNotificationService, EmailService, PushNotificationService],
  exports: [NotificationsService, InAppNotificationService, EmailService, PushNotificationService],
})
export class NotificationsModule {}
