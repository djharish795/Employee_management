// test
// Let's just create a quick test script to call the LeavesService directly using Nest application context
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./apps/api/dist/app.module');
const { LeavesService } = require('./apps/api/dist/modules/leaves/leaves.service');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const leavesService = app.get(LeavesService);
  
  // Find employee id for NAP/OR/002
  const { PrismaService } = require('./apps/api/dist/prisma/prisma.service');
  const prisma = app.get(PrismaService);
  const emp = await prisma.employee.findFirst({ where: { employeeId: 'NAP/OR/002' }});
  
  if (emp) {
    const kpi = await leavesService.getLeavesKPI(emp.id);
    console.log(JSON.stringify(kpi, null, 2));
  }
  
  await app.close();
}
bootstrap();
