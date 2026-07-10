import { PrismaClient, ProjectRole, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding projects...');

  // Create a mock project
  const project = await prisma.project.create({
    data: {
      name: 'Alpha AI Integration',
      description: 'Integrating new AI features into core product.',
      status: ProjectStatus.ACTIVE,
    }
  });
  console.log(`Created project: ${project.name}`);

  // Fetch some employees
  const cto = await prisma.employee.findFirst({ where: { designation: { title: 'CTO' } } });
  const tl = await prisma.employee.findFirst({ where: { designation: { title: 'TL' } } });
  const tr = await prisma.employee.findFirst({ where: { designation: { title: 'TR' } } });

  if (cto && tl) {
    await prisma.projectAssignment.create({
      data: {
        projectId: project.id,
        employeeId: tl.id,
        projectRole: ProjectRole.TL,
      }
    });
    console.log(`Assigned TL to project`);
  }

  if (tl && tr) {
    await prisma.projectAssignment.create({
      data: {
        projectId: project.id,
        employeeId: tr.id,
        projectRole: ProjectRole.TR,
      }
    });
    console.log(`Assigned TR to project`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
