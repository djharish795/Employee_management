import { Module } from "@nestjs/common";
import { CrmController } from "./crm.controller";
import { CrmService } from "./crm.service";
import { CrmRepository } from "./crm.repository";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [CrmController],
  providers: [CrmService, CrmRepository],
  exports: [CrmService, CrmRepository],
})
export class CrmModule { }
