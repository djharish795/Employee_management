const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const engDepts = await prisma.department.findMany({
      where: { name: { contains: 'Eng' } }
    });
    console.log("engDepts:", engDepts);
    const engDeptIds = engDepts.length > 0 ? engDepts.map(d => d.id) : undefined;
    console.log("engDeptIds:", engDeptIds);
    const employees = await prisma.employee.findMany({
      where: { 
        status: 'ACTIVE',
        ...(engDeptIds && { departmentId: { in: engDeptIds } })
      },
    });
    console.log("Found employees:", employees.length);
}
main().catch(console.error).finally(() => prisma.$disconnect());
