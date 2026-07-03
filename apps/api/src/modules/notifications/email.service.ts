import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  async onModuleInit() {
    if (process.env.NODE_ENV === "development") {
      this.logger.log("Initializing Ethereal Email for development...");
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });
        this.logger.log(`Ethereal Email initialized successfully! Emails will be caught here.`);
      } catch (err) {
        this.logger.error("Failed to initialize Ethereal Email", err);
      }
    }
  }

  async sendEmail(to: string, subject: string, templateName: string, context: any) {
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"Naprocs EMS" <${process.env.AWS_SES_FROM_EMAIL || 'noreply@naprocs.in'}>`,
          to,
          subject,
          text: `Template: ${templateName}\n\nContext:\n${JSON.stringify(context, null, 2)}`,
          html: `<p><strong>Template:</strong> ${templateName}</p><pre>${JSON.stringify(context, null, 2)}</pre>`,
        });
        this.logger.log(`[TEST EMAIL SENT] To: ${to} | Subject: ${subject}`);
        this.logger.log(`[VIEW EMAIL HERE]: ${nodemailer.getTestMessageUrl(info)}`);
      } catch (err) {
        this.logger.error(`Failed to send email to ${to}`, err);
      }
    } else {
      this.logger.log(`[MOCK EMAIL] Sending to ${to} | Subject: ${subject} | Template: ${templateName}`);
    }
  }
}
