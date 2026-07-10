import { S3Client } from "@aws-sdk/client-s3";

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
  if (!regionRaw) throw new Error("AWS_REGION is not defined in environment");
  const region = regionRaw.trim();
  const accessKeyId = (process.env.AWS_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.AWS_SECRET_ACCESS_KEY || "").trim();

  const config: ConstructorParameters<typeof S3Client>[0] = { region };

  if (accessKeyId && secretAccessKey) {
    config.credentials = { accessKeyId, secretAccessKey };
  }

  return new S3Client(config);
};
