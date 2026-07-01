import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
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


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
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
<<<<<<< HEAD
    WfhModule,
    HolidaysModule,
=======
    AssetsModule,
>>>>>>> 915c2e1 (Implemented Asset KPI endpoints and DTOs)
  ],
})
export class AppModule { }

