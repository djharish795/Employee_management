import { Module } from '@nestjs/common';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { LeavesRepository } from './leaves.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LeavesController],
  providers: [LeavesService, LeavesRepository],
})
export class LeavesModule {}