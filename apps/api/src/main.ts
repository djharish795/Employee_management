import { ValidationPipe, Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (!process.env.WS_CORS_ORIGIN) {
    throw new Error('WS_CORS_ORIGIN environment variable is required');
  }

  app.enableCors({
    origin: process.env.WS_CORS_ORIGIN,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false, // Set to false so unmapped frontend fields are silently stripped instead of throwing 400 Bad Request
    }),
  );

  const apiVersion = process.env.API_VERSION ?? "v1";
  app.setGlobalPrefix(`api/${apiVersion}`);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  const logger = new Logger('Bootstrap');
  logger.log(`API listening on port ${port}/api/${apiVersion}`);
}

bootstrap();

