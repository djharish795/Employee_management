import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const meetings = await prisma.meeting.findMany();
  let updatedCount = 0;
  for (const meeting of meetings) {
    if (meeting.assignedEmployee && meeting.assignedEmployee.startsWith('c') && meeting.assignedEmployee.length === 25) {
      const emp = await prisma.employee.findUnique({ where: { id: meeting.assignedEmployee } });
      if (emp) {
        const fullName = `${emp.firstName} ${emp.lastName}`;
        await prisma.meeting.update({
          where: { id: meeting.id },
          data: { assignedEmployee: fullName }
        });
        console.log('Updated', meeting.id, 'to', fullName);
        updatedCount++;
      }
    }
  }
  console.log('Total updated:', updatedCount);
}
main().catch(console.error).finally(() => prisma.$disconnect());
