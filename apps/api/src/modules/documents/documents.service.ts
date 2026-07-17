import { Injectable, InternalServerErrorException, Logger, BadRequestException } from "@nestjs/common";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import { createS3Client, generatePresignedDownloadUrl } from "../../common/utils/s3.util";
import { v4 as uuidv4 } from "uuid";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly bucketName: string;
  private readonly s3: S3Client;

  constructor(
    private readonly auditService: AuditService,
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
  ): Promise<{ uploadUrl: string; objectKey: string }> {
    const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${ALLOWED_CONTENT_TYPES.join(', ')}`);
    }

    try {
      const fileExtension = fileName.split(".").pop() || "bin";
      const objectKey = `onboarding/${uuidv4()}.${fileExtension}`;

      // Enforce file size (0 to 5MB) and exact content type
      const { url, fields } = await createPresignedPost(this.s3 as any, {
        Bucket: this.bucketName,
        Key: objectKey,
        Conditions: [
          ["content-length-range", 0, 5242880], // 5MB limit
          ["eq", "$Content-Type", contentType]
        ],
        Fields: {
          "Content-Type": contentType
        },
        Expires: 900 // 15 minutes
      });

      // TODO: Replace 'unknown' with authenticated userId once JWT is implemented
      this.auditService.logCreate({
        moduleName: 'Documents',
        entityId: objectKey,
        actorId: 'unknown',
        metadata: { action: 'GENERATE_UPLOAD_URL', fileName, contentType }
      });

      // Return both url and fields so the frontend can build the FormData POST request
      return { uploadUrl: url, fields, objectKey } as any;
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
  async generateDownloadUrl(objectKey: string): Promise<string> {
    if (!objectKey) return "";

    try {
      const url = await generatePresignedDownloadUrl(this.s3, this.bucketName, objectKey);

      // TODO: Replace 'unknown' with authenticated userId once JWT is implemented
      this.auditService.logExport({
        moduleName: 'Documents',
        entityId: objectKey,
        actorId: 'unknown',
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
}
