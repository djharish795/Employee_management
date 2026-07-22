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
    this.leavesQueue.add('accrue-monthly', {}, {
      repeat: {
        pattern: '0 0 1 * *', // Every 1st of the month at midnight
      },
      jobId: 'accrue-monthly-job',
    }).then(() => {
      this.logger.log('Monthly leave accrual cron job registered successfully');
    }).catch((error: any) => {
      this.logger.error(
        `Failed to register monthly leave accrual cron job: ${error.message}`,
        error.stack,
      );
    });

    this.logger.log('Registering yearly leave rollover cron job in BullMQ');
    this.leavesQueue.add('carry-forward-yearly', {}, {
      repeat: {
        pattern: '0 0 1 6 *', // Every June 1st at midnight (Policy year is June to June)
      },
      jobId: 'carry-forward-yearly-job',
    }).then(() => {
      this.logger.log('Yearly leave rollover cron job registered successfully');
    }).catch((error: any) => {
      this.logger.error(
        `Failed to register yearly leave rollover cron job: ${error.message}`,
        error.stack,
      );
    });

    this.logger.log('Registering stale leave expiry cron job in BullMQ');
    this.leavesQueue.add('expire-stale-leaves', {}, {
      repeat: {
        pattern: '0 0 * * *', // Every midnight
      },
      jobId: 'expire-stale-leaves-job',
    }).then(() => {
      this.logger.log('Stale leave expiry cron job registered successfully');
    }).catch((error: any) => {
      this.logger.error(
        `Failed to register stale leave expiry cron job: ${error.message}`,
        error.stack,
      );
    });
  }
}
