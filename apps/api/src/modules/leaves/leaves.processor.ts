import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { LeavesService } from './leaves.service';
import { Logger } from '@nestjs/common';

@Processor('leaves-queue')
export class LeavesProcessor extends WorkerHost {
  private readonly logger = new Logger(LeavesProcessor.name);
  
  constructor(private readonly leavesService: LeavesService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'accrue-monthly') {
      this.logger.log('Running automated monthly leave accrual via BullMQ');
      return this.leavesService.accrueMonthlyLeaves();
    }
  }
}
