const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const employeeId = 'cmr1mlmyj001p3y1w9ho73rt1';
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      department: true,
      designation: true,
      reportingManager: true,
      user: true,
    },
  });

  if (!employee) throw new Error('Profile not found');

  const decryptData = (data) => data; // Mock decrypt

  const result = {
    ...employee,
    phone: employee.phone ? decryptData(employee.phone) : null,
    alternatePhone: employee.alternatePhone ? decryptData(employee.alternatePhone) : null,
    pan: employee.pan ? decryptData(employee.pan) : null,
    aadhaar: employee.aadhaar ? decryptData(employee.aadhaar) : null,
    bankAccountEnc: employee.bankAccountEnc ? decryptData(employee.bankAccountEnc) : null,
  };

  console.log(JSON.stringify(result, null, 2));
}

main().finally(() => prisma.$disconnect());
