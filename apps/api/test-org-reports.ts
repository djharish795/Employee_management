import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AttendanceService } from './src/modules/attendance/attendance.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const attendanceService = app.get(AttendanceService);
  
  try {
    const data = await attendanceService.getOrgReports();
    console.log("SUCCESS:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("FAILED:", err);
  }
  
  await app.close();
}
bootstrap();
