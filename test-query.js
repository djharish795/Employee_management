const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const e = await prisma.employee.findFirst({
    where: { firstName: "Imthiyaz" },
    include: { user: true, attendanceRecords: true }
  });
  console.log("Imthiyaz Role:", e?.user?.role);
  console.log("Overtime Records:", e?.attendanceRecords.filter(a => a.overtime > 0).map(a => ({
    date: a.date,
    overtime: a.overtime,
    isApp: a.isOvertimeApproved
  })));
  
  const swetha = await prisma.employee.findFirst({
    where: { firstName: "Swetha" },
    include: { user: true, projectAssignments: true }
  });
  console.log("Swetha Role:", swetha?.user?.role);
}

main().finally(() => prisma.$disconnect());
