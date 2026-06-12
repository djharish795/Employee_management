import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "Naprocs@2026!";

async function seedUser(params: {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}) {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const employee = await prisma.employee.upsert({
    where: { officialEmail: params.email },
    update: {
      firstName: params.firstName,
      lastName: params.lastName,
      designation: params.role,
    },
    create: {
      employeeId: params.employeeId,
      firstName: params.firstName,
      lastName: params.lastName,
      officialEmail: params.email,
      designation: params.role,
    },
  });

  await prisma.user.upsert({
    where: { email: params.email },
    update: {
      passwordHash,
      role: params.role,
      status: "ACTIVE",
      employeeId: employee.id,
    },
    create: {
      email: params.email,
      passwordHash,
      role: params.role,
      status: "ACTIVE",
      employeeId: employee.id,
    },
  });
}

async function main() {
  await seedUser({
    employeeId: "EMP-SA-001",
    firstName: "Super",
    lastName: "Admin",
    email: "superadmin@naprocs.in",
    role: UserRole.SUPER_ADMIN,
  });

  await seedUser({
    employeeId: "EMP-CEO-001",
    firstName: "Pradeep",
    lastName: "Chandra",
    email: "ceo@naprocs.in",
    role: UserRole.CEO,
  });

  await seedUser({
    employeeId: "EMP-CTO-001",
    firstName: "Lokesh",
    lastName: "CTO",
    email: "cto@naprocs.in",
    role: UserRole.CTO,
  });

  await seedUser({
    employeeId: "EMP-HR-001",
    firstName: "Tejesh",
    lastName: "Kumar",
    email: "hr@naprocs.in",
    role: UserRole.HR,
  });

  await seedUser({
    employeeId: "EMP-001",
    firstName: "Demo",
    lastName: "Employee",
    email: "employee@naprocs.in",
    role: UserRole.EMPLOYEE,
  });

  console.log("Seed complete. Default password:", DEFAULT_PASSWORD);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
