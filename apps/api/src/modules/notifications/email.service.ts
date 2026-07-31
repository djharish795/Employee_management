import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { PrismaService } from "../../prisma/prisma.service";
import * as Handlebars from "handlebars";
import { SESClient } from "@aws-sdk/client-ses";

import { renderEmailHtml } from "@naprocs/email-templates";

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === "development") {
      this.logger.log("Initializing Ethereal Email for development...");
      try {
        const testAccount = await Promise.race([
          nodemailer.createTestAccount(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Ethereal email network timeout')), 5000))
        ]) as nodemailer.TestAccount;
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.logger.log(`Ethereal Email initialized successfully! Emails will be caught here.`);
      } catch (err) {
        this.logger.error("Failed to initialize Ethereal Email", err);
      }
    } else {
      this.logger.log("Initializing AWS SES for production email delivery...");
      try {
        const sesConfig: any = {
          region: process.env.AWS_SES_REGION || process.env.AWS_REGION || "ap-south-1",
        };
        
        // Only explicitly set credentials if they exist in env,
        // otherwise let AWS SDK securely inherit the ECS Task Role.
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
          sesConfig.credentials = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          };
        }

        const sesClient = new SESClient(sesConfig);
        this.transporter = nodemailer.createTransport({
          SES: { ses: sesClient, aws: require('@aws-sdk/client-ses') }
        } as any);
        this.logger.log(`AWS SES initialized successfully!`);
      } catch (err) {
        this.logger.error("Failed to initialize AWS SES", err);
      }
    }
  }

  async sendEmail(to: string, subject: string, templateName: string, context: any) {
    // Fire-and-forget: offload heavy React rendering and AWS SES networking to the background
    // This prevents the main Node.js event loop from freezing and returns a lightning fast 200 OK to the user
    Promise.resolve().then(async () => {
      const policy = await this.prisma.orgPolicy.findFirst();
      if (policy && !policy.emailNotificationsEnabled) {
        this.logger.log(`[BLOCKED BY POLICY] Email delivery is disabled. Would have sent to ${to} (Template: ${templateName})`);
        return;
      }

      let compiledHtml = "";
      
      try {
        // Use our new React Email rendering package
        compiledHtml = await renderEmailHtml(templateName, context);
      } catch (err) {
        this.logger.error(`React Email rendering failed for template ${templateName}`, err);
        compiledHtml = `<p><strong>Template:</strong> ${templateName}</p><pre>${JSON.stringify(context, null, 2)}</pre>`;
      }

      if (this.transporter) {
        try {
          const info = await this.transporter.sendMail({
            from: `"Naprocs EMS" <${process.env.AWS_SES_FROM_EMAIL || 'noreply@naprocs.in'}>`,
            to,
            subject,
            text: `Template: ${templateName}\n\nContext:\n${JSON.stringify(context, null, 2)}`,
            html: compiledHtml,
          });
          
          if (process.env.NODE_ENV === "development") {
            this.logger.log(`[TEST EMAIL SENT] To: ${to} | Subject: ${subject}`);
            this.logger.log(`[VIEW EMAIL HERE]: ${nodemailer.getTestMessageUrl(info)}`);
          } else {
            this.logger.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
          }
        } catch (err) {
          this.logger.error(`Failed to send email to ${to}`, err);
        }
      } else {
        this.logger.log(`[MOCK EMAIL] Sending to ${to} | Subject: ${subject} | Template: ${templateName}`);
      }
    }).catch(err => {
      this.logger.error(`Background email task failed fatally for ${to}`, err);
    });
  }
}

