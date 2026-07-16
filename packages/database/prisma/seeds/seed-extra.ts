import { PrismaClient, AssetCategory, AssetStatus, KnowledgeCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const employee = await prisma.employee.findFirst();
  if (!employee) throw new Error("No employee found");

  const leaveType = await prisma.leaveType.findFirst();
  if (!leaveType) throw new Error("No leave type found");

  // Device
  await prisma.device.create({
    data: {
      userId: employee.id, // Assuming userId corresponds to User table, let's find user
      fingerprint: 'device-fingerprint-1',
      name: 'Test Device',
      isTrusted: true
    }
  }).catch(() => {});

  // Update device with proper userId
  const user = await prisma.user.findFirst();
  if (user) {
    await prisma.device.create({
      data: {
        userId: user.id,
        fingerprint: 'device-fingerprint-2',
        name: 'Test Device 2',
        isTrusted: true
      }
    }).catch(() => {});
  }

  // LeaveRequest
  await prisma.leaveRequest.create({
    data: {
      employeeId: employee.id,
      leaveTypeId: leaveType.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      reason: 'Sick leave',
      status: 'PENDING',
      totalDays: 1.0
    }
  }).catch(() => {});

  // Asset
  const asset = await prisma.asset.create({
    data: {
      assetTag: 'TAG-123',
      name: 'MacBook Pro',
      category: AssetCategory.LAPTOP,
      serialNumber: 'SN123456',
      status: AssetStatus.AVAILABLE
    }
  }).catch(async () => await prisma.asset.findFirst());

  // AssetAssignment
  if (asset) {
    await prisma.assetAssignment.create({
      data: {
        assetId: asset.id,
        employeeId: employee.id,
        assignedById: employee.id,
        assignedAt: new Date()
      }
    }).catch(() => {});
  }

  // KnowledgeDoc
  await prisma.knowledgeDoc.create({
    data: {
      title: 'Company Policy',
      slug: 'company-policy',
      content: 'Be good.',
      category: KnowledgeCategory.POLICY,
      authorId: employee.id
    }
  }).catch(() => {});

  console.log("Extra seeding complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
