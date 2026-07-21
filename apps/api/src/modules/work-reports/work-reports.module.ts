import { Module } from '@nestjs/common';
import { WorkReportsService } from './work-reports.service';
import { WorkReportsController } from './work-reports.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [PrismaModule, NotificationsModule, EmployeesModule],
  controllers: [WorkReportsController],
  providers: [WorkReportsService],
  exports: [WorkReportsService],
})
export class WorkReportsModule {}
