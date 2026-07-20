import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const emp = await prisma.employee.findUnique({
    where: { personalEmail: 'swetha@naprocs.in' },
    include: {
      connectMeetingsAsAssignee: true,
      connectMeetingsAsCreator: true
    }
  });
  console.log("Connect Data for Swetha:");
  console.log(JSON.stringify(emp?.connectMeetingsAsAssignee, null, 2));
  console.log(JSON.stringify(emp?.connectMeetingsAsCreator, null, 2));

  // Check CEM leads/meetings
  const cemLeads = await prisma.cemLead.findMany({
    where: { ownerId: emp?.id }
  });
  console.log("CEM Leads for Swetha:");
  console.log(cemLeads.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
