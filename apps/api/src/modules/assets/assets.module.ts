import { Module } from "@nestjs/common";
import { AssetsController, CtoAssetsController } from "./assets.controller";
import { AssetsService } from "./assets.service";
import { AssetsRepository } from "./assets.repository";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AssetsController, CtoAssetsController],
  providers: [AssetsService, AssetsRepository],
  exports: [AssetsService],
})
export class AssetsModule {}

