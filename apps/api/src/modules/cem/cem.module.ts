import { Module } from '@nestjs/common';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { FollowUpController } from './follow-up.controller';
import { FollowUpService } from './follow-up.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MeetingController, FollowUpController],
  providers: [MeetingService, FollowUpService]
})
export class CemModule {}
