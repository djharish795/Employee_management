import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';
import { EmailService } from '../notifications/email.service';
import { MasterAdminGuard } from './master-admin.guard';
import { MasterAdminAuthService } from './master-admin-auth.service';
import { ActivityService } from './activity.service';
import { ObservatoryService } from './observatory.service';
import { SecurityAlertService } from './security-alert.service';
import { MasterAdminController } from './master-admin.controller';
import { MasterAdminGateway } from './master-admin.gateway';
import { TelemetryController } from './telemetry.controller';
import { TelemetryBufferService } from './telemetry-buffer.service';
import { AnomalyEngineService } from './anomaly-engine.service';

@Module({
  imports: [
    JwtModule.register({}),
    PrismaModule,
    RedisModule,
  ],
  controllers: [MasterAdminController, TelemetryController],
  providers: [
    PrismaService,
    EmailService,
    MasterAdminGuard,
    MasterAdminAuthService,
    ActivityService,
    ObservatoryService,
    SecurityAlertService,
    MasterAdminGateway,
    TelemetryBufferService,
    AnomalyEngineService,
  ],
  exports: [MasterAdminAuthService, ActivityService, ObservatoryService, SecurityAlertService, TelemetryBufferService],
})
export class MasterAdminModule {}
