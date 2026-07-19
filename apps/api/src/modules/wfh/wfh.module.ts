import { Module } from '@nestjs/common';
import { WfhController } from './wfh.controller';
import { WfhService } from './wfh.service';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [RbacModule],
  controllers: [WfhController],
  providers: [WfhService]
})
export class WfhModule {}

