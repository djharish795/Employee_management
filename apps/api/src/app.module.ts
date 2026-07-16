import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { BullModule } from "@nestjs/bullmq";
import { AuthModule } from "./modules/auth/auth.module";
import { DocumentsModule } from "./modules/documents/documents.module";
import { LeavesModule } from "./modules/leaves/leaves.module";
import { HealthModule } from "./modules/health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { EmployeesModule } from "./modules/employees/employees.module";
import { OrganizationModule } from "./modules/organization/organization.module";
import { RbacModule } from "./modules/rbac/rbac.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { WfhModule } from "./modules/wfh/wfh.module";
import { HolidaysModule } from "./modules/holidays/holidays.module";
import { AssetsModule } from "./modules/assets/assets.module";
import { KnowledgeModule } from "./modules/knowledge/knowledge.module";
import { OnboardingModule } from "./modules/onboarding/onboarding.module";
import { ConnectModule } from "./modules/connect/connect.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { WorkflowsModule } from "./modules/workflows/workflows.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { SuccessionModule } from "./modules/succession/succession.module";
import { ComplianceModule } from "./modules/compliance/compliance.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { DepartmentsModule } from './modules/departments/departments.module';
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { SearchModule } from './modules/search/search.module';
import { LifecycleModule } from "./modules/lifecycle/lifecycle.module";
import { ProjectsModule } from './modules/projects/projects.module';
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: 60,
            limit: 10,
          },
        ],
      }),
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const tlsEnabled = config.get<string>('REDIS_TLS', 'false') === 'true';
        return {
          connection: {
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: Number(config.get<string>('REDIS_PORT', '6379')),
            password: config.get<string>('REDIS_PASSWORD') || undefined,
            tls: tlsEnabled ? {} : undefined,
            // Prevent BullMQ from crashing the process on transient Redis errors:
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            retryStrategy: (times: number) => Math.min(times * 500, 5000),
          },
        };
      },
    }),
    PrismaModule,
    RedisModule,
    HealthModule,
    AuthModule,
    DashboardModule,
    EmployeesModule,
    OrganizationModule,
    DocumentsModule,
    RbacModule,
    AuditModule,
    AttendanceModule,
    WfhModule,
    HolidaysModule,
    AssetsModule,
    LeavesModule,
    KnowledgeModule,
    OnboardingModule,
    ConnectModule,
    TasksModule,
    WorkflowsModule,
    ProfileModule,
    SuccessionModule,
    ComplianceModule,
    ReportsModule,
    DepartmentsModule,
    NotificationsModule,
    SearchModule,
    LifecycleModule,
    ProjectsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule { }
