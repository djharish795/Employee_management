import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for employees without a user account...");

  const employees = await prisma.employee.findMany({
    include: { user: true }
  });

  const missingUsers = employees.filter(emp => !emp.user);

  if (missingUsers.length === 0) {
    console.log("All employees have a user account. Nothing to fix.");
    return;
  }

  console.log(`Found ${missingUsers.length} employees without a user account. Fixing...`);

  const DEV_PASSWORD = "ChangeMe123!";
  const DEV_PASSWORD_HASH = bcrypt.hashSync(DEV_PASSWORD, 10);

  for (const emp of missingUsers) {
    console.log(`Creating user for: ${emp.firstName} ${emp.lastName} (${emp.officialEmail})`);
    
    await prisma.user.create({
      data: {
        employeeId: emp.id,
        email: emp.officialEmail,
        passwordHash: DEV_PASSWORD_HASH,
        role: UserRole.EMPLOYEE,
      }
    });
  }

  console.log("Successfully created missing user accounts!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
