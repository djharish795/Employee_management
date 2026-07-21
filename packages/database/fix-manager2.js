const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { employee: true }
  });
  
  const ceoUser = users.find(u => u.role === 'CEO');
  const omUser = users.find(u => u.role === 'OM');
  
  if (ceoUser?.employee && omUser?.employee) {
    await prisma.employee.update({
      where: { id: omUser.employee.id },
      data: { reportingManagerId: ceoUser.employee.id }
    });
    console.log('Fixed OM manager to CEO:', ceoUser.employee.id);
  } else {
    console.log('Could not find CEO or OM user/employee');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
