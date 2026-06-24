import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client } from "@aws-sdk/client-s3";
import { createS3Client } from "../../common/utils/s3.util";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class DocumentsService {
  private readonly bucketName: string;
  private readonly s3: S3Client;

  constructor() {
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
    try {
      const fileExtension = fileName.split(".").pop() || "bin";
      const objectKey = `onboarding/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
        ContentType: contentType,
      });

      // Expires in 15 minutes (900 seconds) per AGENTS.md security rules.
      const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 900 });

      return { uploadUrl, objectKey };
    } catch (error: any) {
      console.error("[DocumentsService] Error generating S3 upload URL:", {
        message: error?.message,
        code: error?.Code || error?.name,
        bucket: this.bucketName,
        // Log only first 8 chars of key for debugging without exposing the full key
        accessKeyId: (process.env.AWS_ACCESS_KEY_ID || "").trim().substring(0, 8) + "...",
      });
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
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: objectKey,
      });

      return await getSignedUrl(this.s3, command, { expiresIn: 900 });
    } catch (error: any) {
      console.error("[DocumentsService] Error generating S3 download URL:", {
        message: error?.message,
        code: error?.Code || error?.name,
      });
      throw new InternalServerErrorException("Failed to generate document download URL");
    }
  }
}
