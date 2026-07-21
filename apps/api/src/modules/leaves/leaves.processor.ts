import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
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
    } else if (job.name === 'carry-forward-yearly') {
      this.logger.log('Running automated yearly leave rollover via BullMQ');
      return this.leavesService.carryForwardYearlyLeaves();
    }
  }

  @OnWorkerEvent('error')
  onError(err: Error) {
    this.logger.warn(`BullMQ Worker error: ${err.message}`);
  }
}
