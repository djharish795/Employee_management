import { Module } from '@nestjs/common';
import { WfhController } from './wfh.controller';
import { WfhService } from './wfh.service';

@Module({
  controllers: [WfhController],
  providers: [WfhService]
})
export class WfhModule {}
