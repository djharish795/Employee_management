import { PrismaClient, EmployeeStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.employee.updateMany({
    where: { employeeId: 'EMP-COO-NONE' },
    data: { status: EmployeeStatus.ACTIVE }
  });
  console.log("Set COO to ACTIVE");
}

main().catch(console.error).finally(() => prisma.$disconnect());
