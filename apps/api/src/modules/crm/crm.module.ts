import { Module } from "@nestjs/common";
import { CrmController } from "./crm.controller";
import { CrmService } from "./crm.service";
import { CrmRepository } from "./crm.repository";
import { PrismaModule } from "../../prisma/prisma.module";
import { ConnectModule } from "../connect/connect.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [PrismaModule, ConnectModule, NotificationsModule],
  controllers: [CrmController],
  providers: [CrmService, CrmRepository],
  exports: [CrmService, CrmRepository],
})
export class CrmModule { }
