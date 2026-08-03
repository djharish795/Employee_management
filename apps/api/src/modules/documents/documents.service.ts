import { Injectable, InternalServerErrorException, Logger, BadRequestException } from "@nestjs/common";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import { createS3Client, generatePresignedDownloadUrl } from "../../common/utils/s3.util";
import { v4 as uuidv4 } from "uuid";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../../prisma/prisma.service";
import { RbacGroups } from "../../common/rbac/rbac.config";
import { ForbiddenException } from "@nestjs/common";

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly bucketName: string;
  private readonly s3: S3Client;

  constructor(
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {
    // Trim bucket name — dotenv does NOT strip inline comments, so raw env
    // values may include trailing " # comment" text if .env has inline comments.
    this.bucketName = (process.env.AWS_S3_BUCKET || "naprocs-ems-documents").trim();

    // Create a fresh S3Client reading credentials from process.env.
    // Using a factory (not a module-level singleton) so NestJS hot-reloads
    // always pick up the latest env values.
    this.s3 = createS3Client();
  }

  /**
   * Generates a 15-minute presigned URL to allow the frontend to directly
   * upload a file to S3 without routing the binary data through our API.
   */
  async generateUploadUrl(
    fileName: string,
    contentType: string,
    user?: any
  ): Promise<{ uploadUrl: string; objectKey: string }> {
    const ALLOWED_CONTENT_TYPES = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
    }

    try {
      const extensionMap: Record<string, string> = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/msword': 'doc',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
      };
      const fileExtension = extensionMap[contentType];
      const objectKey = `onboarding/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        ContentType: contentType
      });
      const url = await getSignedUrl(this.s3, command, { expiresIn: 900 });

      this.auditService.logCreate({
        moduleName: 'Documents',
        entityId: objectKey,
        actorId: user.employeeId,
        metadata: { action: 'GENERATE_UPLOAD_URL', fileName, contentType }
      });

      // Return url and objectKey so the frontend can execute a PUT request
      return { uploadUrl: url, objectKey } as any;
    } catch (error: any) {
      this.logger.error("[DocumentsService] Error generating S3 upload URL:", {
        message: error?.message,
        code: error?.Code || error?.name,
        bucket: this.bucketName,
        // Log only first 8 chars of key for debugging without exposing the full key
        accessKeyId: (process.env.AWS_ACCESS_KEY_ID || "").trim().substring(0, 8) + "...",
      }, error.stack || error);
      throw new InternalServerErrorException("Failed to generate document upload URL");
    }
  }

  /**
   * Generates a 15-minute presigned URL to securely view/download a file.
   * Access ONLY via pre-signed URLs (15-min expiry) as per AGENTS.md.
   */
  async generateDownloadUrl(objectKey: string, user?: any): Promise<string> {
    if (!objectKey) return "";

    // If objectKey is an external URL, return it directly
    if (objectKey.startsWith("http://") || objectKey.startsWith("https://")) {
      return objectKey;
    }

    // If objectKey contains raw HTML content, return a formatted data URL
    if (objectKey.trim().startsWith("<")) {
      return `data:text/html;charset=utf-8,${encodeURIComponent(objectKey)}`;
    }

    if (user) {
      const isGlobalReader = RbacGroups.HR_OR_SUPER_ADMIN.includes(user.role as any) || user.role === 'CRM' || user.role === 'CEM';
      if (!isGlobalReader) {
        // Check if the document belongs to a published knowledge base article
        const isKnowledgeDoc = await this.prisma.knowledgeDoc.findFirst({
          where: { content: objectKey, isPublished: true }
        });

        if (!isKnowledgeDoc) {
          // Strict IDOR Check: Verify the objectKey is explicitly linked to authorized fields
          let isAuthorized = false;

          const employee = await this.prisma.employee.findUnique({ where: { id: user.employeeId } });
          if (!employee) throw new ForbiddenException("Employee not found");
          
          if (employee.photoUrl === objectKey || employee.digitalSignatureUrl === objectKey) {
            isAuthorized = true;
          }

          if (!isAuthorized && employee.documents) {
            try {
              const docs = typeof employee.documents === 'string' ? JSON.parse(employee.documents) : employee.documents;
              const searchJsonValues = (obj: any): boolean => {
                if (typeof obj === 'string') return obj === objectKey;
                if (typeof obj === 'object' && obj !== null) {
                  return Object.values(obj).some(v => searchJsonValues(v));
                }
                return false;
              };
              if (searchJsonValues(docs)) isAuthorized = true;
            } catch (e) {}
          }

          if (!isAuthorized) {
            const fieldwork = await this.prisma.fieldWorkRequest.findFirst({
              where: { employeeId: user.employeeId, objectKey }
            });
            if (fieldwork) isAuthorized = true;
          }

          if (!isAuthorized) {
            const leave = await this.prisma.leaveRequest.findFirst({
              where: { employeeId: user.employeeId, attachmentUrl: objectKey }
            });
            if (leave) isAuthorized = true;
          }

          if (!isAuthorized) {
            const payslip = await this.prisma.payrollLineItem.findFirst({
              where: { employeeId: user.employeeId, payslipUrl: objectKey }
            });
            if (payslip) isAuthorized = true;
          }

          // @ts-ignore - Catching dynamically generated Prisma models
          if (!isAuthorized && this.prisma.reimbursement) {
            // @ts-ignore
            const reimbursement = await this.prisma.reimbursement.findFirst({
              where: { employeeId: user.employeeId, receiptUrl: objectKey }
            });
            if (reimbursement) isAuthorized = true;
          }

          if (!isAuthorized) {
            throw new ForbiddenException("You are not authorized to view this document");
          }
        }
      }
    }

    try {
      const url = await generatePresignedDownloadUrl(this.s3, this.bucketName, objectKey);

      this.auditService.logExport({
        moduleName: 'Documents',
        entityId: objectKey,
        actorId: user.employeeId,
        metadata: { action: 'GENERATE_DOWNLOAD_URL' }
      });

      return url;
    } catch (error: any) {
      this.logger.error("[DocumentsService] Error generating S3 download URL:", {
        message: error?.message,
        code: error?.Code || error?.name,
      }, error.stack || error);
      throw new InternalServerErrorException("Failed to generate document download URL");
    }
  }

  /**
   * Uploads a file directly to S3 after stripping EXIF data if it is an image.
   */
  async uploadAndStripExif(file: Express.Multer.File, user?: any): Promise<{ objectKey: string }> {
    const ALLOWED_CONTENT_TYPES = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (!ALLOWED_CONTENT_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
    }
    if (file.size > 5242880) { // 5MB
      throw new BadRequestException("File is too large. Max size is 5MB");
    }

    try {
      const extensionMap: Record<string, string> = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/msword': 'doc',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
      };
      const fileExtension = extensionMap[file.mimetype];
      const objectKey = `onboarding/${uuidv4()}.${fileExtension}`;
      let bufferToUpload = file.buffer;

      // If it's an image, strip EXIF metadata using sharp
      if (file.mimetype.startsWith('image/')) {
        const sharp = require('sharp');
        bufferToUpload = await sharp(file.buffer).toBuffer();
      }

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        Body: bufferToUpload,
        ContentType: file.mimetype,
      });

      await this.s3.send(command);

      this.auditService.logCreate({
        moduleName: 'Documents',
        entityId: objectKey,
        actorId: user.employeeId,
        metadata: { action: 'UPLOAD_DOCUMENT', fileName: file.originalname, contentType: file.mimetype }
      });

      return { objectKey };
    } catch (error: any) {
      this.logger.error("[DocumentsService] Error uploading file:", {
        message: error?.message,
        code: error?.Code || error?.name,
        bucket: this.bucketName,
      }, error.stack || error);
      throw new InternalServerErrorException("Failed to upload document");
    }
  }
}
