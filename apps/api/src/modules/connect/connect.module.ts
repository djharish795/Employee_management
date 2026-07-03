import { Module } from "@nestjs/common";
import { ConnectController } from "./connect.controller";
import { ConnectService } from "./connect.service";
import { ConnectRepository } from "./connect.repository";
import { ZoomService } from "./zoom.service";
import { EmailService } from "../notifications/email.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { TasksModule } from "../tasks/tasks.module";

@Module({
  imports: [PrismaModule, TasksModule],
  controllers: [ConnectController],
  providers: [
    ConnectService,
    ConnectRepository,
    ZoomService,
    EmailService,
  ],
  exports: [ConnectService],
})
export class ConnectModule {}
