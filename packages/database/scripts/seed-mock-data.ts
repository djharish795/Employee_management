import { PrismaClient, UserRole, EmployeeStatus, FieldWorkStatus, ReportStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Helper to get user
  const getUser = async (role: UserRole) => {
    const user = await prisma.user.findFirst({
      where: { role },
      include: { employee: true }
    });
    return user;
  };

  const oe = await getUser(UserRole.OE) || await getUser(UserRole.EMPLOYEE);
  const om = await getUser(UserRole.OM) || await getUser(UserRole.CEO);
  const cem = await getUser(UserRole.CEM) || await getUser(UserRole.EMPLOYEE);
  const crm = await getUser(UserRole.CRM) || await getUser(UserRole.EMPLOYEE);

  if (!oe || !om || !cem || !crm) {
    console.error("Required users not found. Make sure base users exist.");
    return;
  }

  // Create Field Work Requests for OE
  await prisma.fieldWorkRequest.createMany({
    data: [
      {
        employeeId: oe.employee!.id,
        approverId: om.employee!.id,
        date: new Date(),
        startTime: '10:00',
        endTime: '14:00',
        destination: 'Client HQ',
        purpose: 'Site Visit',
        description: 'Monthly site visit',
        transportation: 'Cab',
        returnTime: '15:00',
        contact: 'encrypted_contact_info',
        status: FieldWorkStatus.PENDING,
      },
      {
        employeeId: oe.employee!.id,
        approverId: om.employee!.id,
        date: new Date(),
        startTime: '09:00',
        endTime: '12:00',
        destination: 'Branch Office',
        purpose: 'Audit',
        description: 'Quarterly audit',
        transportation: 'Metro',
        returnTime: '13:00',
        contact: 'encrypted_contact_info',
        status: FieldWorkStatus.APPROVED,
      }
    ]
  });

  // Create Work Reports for OE to be reviewed by OM
  await prisma.workReport.createMany({
    data: [
      {
        employeeId: oe.employee!.id,
        reviewerId: om.employee!.id,
        department: 'Operations',
        reportType: 'Daily Standup',
        title: 'OE Daily Report',
        content: 'Completed field visit.',
        status: ReportStatus.PENDING,
        priority: 'MEDIUM',
      },
      {
        employeeId: oe.employee!.id,
        reviewerId: om.employee!.id,
        department: 'Operations',
        reportType: 'Weekly Sync',
        title: 'OE Weekly Report',
        content: 'All tasks completed successfully.',
        status: ReportStatus.APPROVED,
        priority: 'HIGH',
      }
    ]
  });

  // Create CRM Leads
  const lead1 = await prisma.cemLead.create({
    data: {
      company: 'Tech Corp',
      prospectName: 'John Doe',
      industry: 'Technology',
      email: 'john@techcorp.com',
      phone: '9999999999',
      stage: 1,
      priority: 'HIGH',
      leadSource: 'Website',
      assignedCrm: crm.employee!.id,
      assignedCemId: cem.employee!.id,
      qualificationStatus: 'ACTIVE',
    }
  });

  // Create FollowUp for CEM Lead
  await prisma.followUp.create({
    data: {
      cemLeadId: lead1.id,
      leadName: 'John Doe',
      company: 'Tech Corp',
      email: 'john@techcorp.com',
      phone: '9999999999',
      dueDate: new Date(),
      type: 'CALL',
      status: 'Pending',
      nextAction: 'Schedule Demo',
      assignedCem: cem.employee!.firstName,
      lastNote: 'Initial discussion',
    }
  });

  // Create Meeting for CEM Lead
  await prisma.meeting.create({
    data: {
      cemLeadId: lead1.id,
      client: 'Tech Corp',
      leadId: lead1.id,
      leadName: 'John Doe',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      type: 'DISCOVERY_CALL',
      assignedEmployee: cem.employee!.firstName,
      status: 'SCHEDULED',
      notes: 'Intro Sync',
    }
  });

  console.log('Mock data seeded successfully.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
