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
<<<<<<< HEAD
    LeavesModule,
=======
    RbacModule,
    AuditModule,
>>>>>>> 0ea0c16ed861d22e50ddb19736f5c68e5a31ab54
  ],
})
export class AppModule { }
