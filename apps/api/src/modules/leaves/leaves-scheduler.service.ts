import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class LeavesSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(LeavesSchedulerService.name);

  constructor(@InjectQueue('leaves-queue') private readonly leavesQueue: Queue) {
    this.leavesQueue.on('error', (err: Error) => {
      // Catch connection errors silently or as warnings so they don't crash Node via EventEmitter
      this.logger.warn(`BullMQ Queue error: ${err.message}`);
    });
  }
  async onModuleInit() {
    this.logger.log('Registering monthly leave accrual cron job in BullMQ');
    try {
      await this.leavesQueue.add('accrue-monthly', {}, {
        repeat: {
          pattern: '0 0 1 * *', // Every 1st of the month at midnight
        },
        jobId: 'accrue-monthly-job',
      });
      this.logger.log('Monthly leave accrual cron job registered successfully');
    } catch (error: any) {
      // Log the error but do NOT crash the process — Redis may be temporarily
      // unavailable during startup. The job will be re-registered on next restart.
      this.logger.error(
        `Failed to register monthly leave accrual cron job: ${error.message}`,
        error.stack,
      );
    }
  }
}
