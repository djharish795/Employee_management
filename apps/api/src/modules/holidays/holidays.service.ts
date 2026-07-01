import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class HolidaysService {
  private readonly logger = new Logger(HolidaysService.name);
  private sesClient: SESClient;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.sesClient = new SESClient({
      region: this.configService.get<string>('AWS_SES_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async getAllHolidays() {
    return this.prisma.companyHoliday.findMany({
      orderBy: { date: 'asc' },
    });
  }

  async createHoliday(data: { name: string; date: Date; description?: string }) {
    const holiday = await this.prisma.companyHoliday.create({
      data: {
        name: data.name,
        date: data.date,
        description: data.description,
      },
    });

    await this.notifyCompanyOfHoliday(holiday);

    return holiday;
  }

  private async notifyCompanyOfHoliday(holiday: { name: string; date: Date; description: string | null }) {
    try {
      const activeEmployees = await this.prisma.employee.findMany({
        where: { status: 'ACTIVE' },
        select: { officialEmail: true },
      });

      if (activeEmployees.length === 0) return;

      const toAddresses = activeEmployees.map(e => e.officialEmail);
      const formattedDate = new Date(holiday.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const params = {
        Destination: {
          BccAddresses: toAddresses, // Use Bcc for bulk emails to protect privacy
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: `
                <h2>Naprocs Technologies Holiday Announcement</h2>
                <p>Dear Team,</p>
                <p>Please be informed that <strong>${formattedDate}</strong> has been declared a company holiday on account of <strong>${holiday.name}</strong>.</p>
                ${holiday.description ? `<p>${holiday.description}</p>` : ''}
                <br/>
                <p>Enjoy your holiday!</p>
                <p>Best Regards,<br/>HR Department<br/>Naprocs Technologies</p>
              `,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: `Holiday Announcement: ${holiday.name} on ${formattedDate}`,
          },
        },
        Source: this.configService.get<string>('AWS_SES_FROM_EMAIL'),
      };

      const command = new SendEmailCommand(params);
      await this.sesClient.send(command);
      this.logger.log(`Holiday notification sent to ${toAddresses.length} employees for ${holiday.name}`);
    } catch (error) {
      this.logger.error('Failed to send holiday notification', error);
    }
  }

  @Cron('0 10 * * *', { timeZone: 'Asia/Kolkata' }) // Runs every day at 10:00 AM IST
  async sendUpcomingHolidayReminders() {
    this.logger.log('Running daily upcoming holiday check...');
    
    // Calculate tomorrow's date at midnight UTC
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);
    nextDay.setDate(tomorrow.getDate() + 1);

    // Find any holiday falling exactly tomorrow
    const upcomingHolidays = await this.prisma.companyHoliday.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: nextDay
        }
      }
    });

    if (upcomingHolidays.length === 0) {
      return;
    }

    try {
      const activeEmployees = await this.prisma.employee.findMany({
        where: { status: 'ACTIVE' },
        select: { officialEmail: true },
      });

      if (activeEmployees.length === 0) return;

      const toAddresses = activeEmployees.map(e => e.officialEmail);

      for (const holiday of upcomingHolidays) {
        const formattedDate = new Date(holiday.date).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const params = {
          Destination: {
            BccAddresses: toAddresses, // Use Bcc for bulk emails
          },
          Message: {
            Body: {
              Html: {
                Charset: 'UTF-8',
                Data: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4f46e5;">Upcoming Holiday Reminder</h2>
                    <p>Dear Team,</p>
                    <p>This is a gentle reminder that tomorrow, <strong>${formattedDate}</strong>, is a company holiday on account of <strong>${holiday.name}</strong>.</p>
                    ${holiday.description ? `<p style="color: #64748b; font-style: italic;">${holiday.description}</p>` : ''}
                    <br/>
                    <p>Please ensure you have completed all pending urgent tasks before you log off today.</p>
                    <p>Wishing you a wonderful holiday!</p>
                    <hr style="border: 1px solid #e2e8f0; margin-top: 30px;" />
                    <p style="font-size: 12px; color: #94a3b8;">Best Regards,<br/>HR Department<br/>Naprocs Technologies</p>
                  </div>
                `,
              },
            },
            Subject: {
              Charset: 'UTF-8',
              Data: `Holiday Reminder: ${holiday.name} is tomorrow!`,
            },
          },
          Source: this.configService.get<string>('AWS_SES_FROM_EMAIL'),
        };

        const command = new SendEmailCommand(params);
        await this.sesClient.send(command);
        this.logger.log(`Upcoming holiday reminder sent to ${toAddresses.length} employees for ${holiday.name}`);
      }
    } catch (error) {
      this.logger.error('Failed to send upcoming holiday reminder', error);
    }
  }

  async deleteHoliday(id: string) {
    return this.prisma.companyHoliday.delete({
      where: { id },
    });
  }
}
