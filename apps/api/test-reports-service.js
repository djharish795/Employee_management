const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.employee.findFirst().then(e => {
  const empId = e ? e.id : null;
  console.log('Valid Emp ID:', empId);
  const { NestFactory } = require('@nestjs/core');
  const { AppModule } = require('./dist/app.module');
  const { ReportsService } = require('./dist/modules/reports/reports.service');
  
  NestFactory.createApplicationContext(AppModule).then(async app => {
    const reportsService = app.get(ReportsService);
    console.log('Generating report...');
    try {
      const result = await reportsService.generateReport('HEADCOUNT', 'PDF', empId);
      console.log('Success:', result);
    } catch(err) {
      console.error('FAILED:', err);
    }
    await app.close();
    prisma.$disconnect();
  });
});
