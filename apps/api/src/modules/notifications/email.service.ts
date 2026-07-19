import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { PrismaService } from "../../prisma/prisma.service";
import * as Handlebars from "handlebars";
import { SESClient } from "@aws-sdk/client-ses";

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly prisma: PrismaService) {}

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
    } else {
      this.logger.log("Initializing AWS SES for production email delivery...");
      try {
        const sesClient = new SESClient({
          region: process.env.AWS_SES_REGION || process.env.AWS_REGION || "ap-south-1",
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
          },
        });
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
    const policy = await this.prisma.orgPolicy.findFirst();
    if (policy && !policy.emailNotificationsEnabled) {
      this.logger.log(`[BLOCKED BY POLICY] Email delivery is disabled. Would have sent to ${to} (Template: ${templateName})`);
      return;
    }

    let compiledHtml = `<p><strong>Template:</strong> ${templateName}</p><pre>${JSON.stringify(context, null, 2)}</pre>`;
    let finalSubject = subject;

    const template = await this.prisma.emailTemplate.findUnique({
      where: { code: templateName.toUpperCase() }
    });

    if (template) {
      try {
        const templateSubject = Handlebars.compile(template.subject);
        const templateBody = Handlebars.compile(template.bodyHtml);
        finalSubject = templateSubject(context);
        compiledHtml = templateBody(context);
      } catch (err) {
        this.logger.error(`Handlebars compilation failed for template ${templateName}`, err);
      }
    }

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"Naprocs EMS" <${process.env.AWS_SES_FROM_EMAIL || 'noreply@naprocs.in'}>`,
          to,
          subject: finalSubject,
          text: `Template: ${templateName}\n\nContext:\n${JSON.stringify(context, null, 2)}`,
          html: compiledHtml,
        });
        
        if (process.env.NODE_ENV === "development") {
          this.logger.log(`[TEST EMAIL SENT] To: ${to} | Subject: ${finalSubject}`);
          this.logger.log(`[VIEW EMAIL HERE]: ${nodemailer.getTestMessageUrl(info)}`);
        } else {
          this.logger.log(`[EMAIL SENT] To: ${to} | Subject: ${finalSubject}`);
        }
      } catch (err) {
        this.logger.error(`Failed to send email to ${to}`, err);
      }
    } else {
      this.logger.log(`[MOCK EMAIL] Sending to ${to} | Subject: ${finalSubject} | Template: ${templateName}`);
    }
  }
}
