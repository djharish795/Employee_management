import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.WS_CORS_ORIGIN ?? "http://localhost:3000",
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
  await app.listen(port, "0.0.0.0");
  console.log(`API listening on http://localhost:${port}/api/${apiVersion}`);
}

bootstrap();

