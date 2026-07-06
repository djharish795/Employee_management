import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    ScheduleModule.forRoot(),
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
  ],
})
export class AppModule { }

