import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
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

  // In development, automatically kill any ghost processes holding the port before binding.
  // This permanently fixes EADDRINUSE errors during nest start --watch hot reloads on Windows.
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { execSync } = require('child_process');
      if (process.platform === 'win32') {
        const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
        const lines = output.split('\n').filter(Boolean);
        const pids = new Set<string>();
        for (const line of lines) {
          if (line.includes('LISTENING')) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0' && pid !== String(process.pid)) pids.add(pid);
          }
        }
        for (const pid of pids) {
          try { execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' }); } catch (e) {}
        }
      } else {
        const output = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
        const pids = output.split('\n').filter(Boolean);
        for (const pid of pids) {
          if (pid !== String(process.pid)) {
            try { execSync(`kill -9 ${pid}`, { stdio: 'ignore' }); } catch (e) {}
          }
        }
      }
    } catch (e) {
      // Ignore if no process is found
    }
  }

  await app.listen(port, "0.0.0.0");
  console.log(`API listening on http://localhost:${port}/api/${apiVersion}`);
}

bootstrap();

