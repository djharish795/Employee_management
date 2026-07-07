import { Module } from '@nestjs/common';
import { SuccessionService } from './succession.service';
import { SuccessionController } from './succession.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SuccessionController],
  providers: [SuccessionService],
  exports: [SuccessionService],
})
export class SuccessionModule {}