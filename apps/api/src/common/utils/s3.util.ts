import { S3Client } from "@aws-sdk/client-s3";
import { InternalServerErrorException } from "@nestjs/common";

/**
 * Creates a fresh S3Client reading credentials directly from process.env.
 *
 * Called once per DocumentsService instantiation (NestJS recreates services
 * on each hot-reload in watch mode), ensuring fresh env values are always used.
 *
 * NOTE: All .env values must have NO inline comments — dotenv does NOT strip
 * them and they will corrupt the credential strings (appended as part of value).
 */
export const createS3Client = (): S3Client => {
  const regionRaw = process.env.AWS_REGION;
  if (!regionRaw) throw new InternalServerErrorException("AWS_REGION is not defined in environment");
  const region = regionRaw.trim();
  const accessKeyId = (process.env.AWS_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.AWS_SECRET_ACCESS_KEY || "").trim();

  const config: ConstructorParameters<typeof S3Client>[0] = { region };

  if (accessKeyId && secretAccessKey) {
    config.credentials = { accessKeyId, secretAccessKey };
  }

  return new S3Client(config);
};

/**
 * Generates a 15-minute presigned URL to securely view/download a file.
 * Access ONLY via pre-signed URLs (15-min expiry) as per AGENTS.md.
 */
export async function generatePresignedDownloadUrl(
  s3: S3Client,
  bucketName: string,
  objectKey: string,
  expiresIn = 900
): Promise<string> {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Permanently deletes an object from S3.
 * Used for DPDPA compliance when erasing an employee's PII/documents.
 */
export async function deleteFromS3(
  s3: S3Client,
  bucketName: string,
  objectKey: string
): Promise<void> {
  if (!objectKey || objectKey.trim() === '') return;
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });
  await s3.send(command);
}
