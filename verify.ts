import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const schemaPath = path.join(__dirname, 'packages', 'database', 'prisma', 'schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const models = [...schema.matchAll(/model\s+([A-Za-z0-9_]+)\s+\{/g)].map(m => m[1]);
  console.log(`Total models: ${models.length}`);
  
  const phase1Tables = [
    'Employee', 'Department', 'Designation', 'User', 'Device', 'Session', 'OTPVerification',
    'AttendanceRecord', 'LeaveType', 'LeaveBalance', 'LeaveRequest', 'Asset', 'AssetAssignment',
    'Notification', 'Workflow', 'WorkflowInstance', 'KnowledgeDoc', 'AuditLog', 'ConsentLog',
    'DataErasureRequest', 'GrievanceCase', 'AppSetting'
  ];
  
  const phase2Tables = [
    'SalaryStructure', 'PayrollRun', 'PayrollLineItem', 'Reimbursement', 'Job', 'Candidate',
    'Interview', 'Offer', 'Goal', 'ReviewCycle', 'PerformanceReview', 'Skill', 'EmployeeSkill',
    'Course', 'Enrollment', 'Survey', 'SurveyResponse', 'Recognition', 'SuccessionPlan',
    'TalentApplication', 'TransferRequest'
  ];
  
  const phase3Tables = [
    'EmbeddingVector', 'AttritionRiskScore', 'AIInsight', 'AIChat'
  ];
  
  // Model counts verify
  for (const model of phase1Tables) {
    const regex = new RegExp(`(//\\s*@phase[\\s\\S]*?)\\nmodel\\s+${model}\\s+\\{`, 'g');
    if (regex.test(schema)) {
      console.log(`FAIL: P1 model ${model} has phase comment`);
    }
  }
  
  for (const model of phase2Tables) {
    const regex = new RegExp(`//\\s*@phase\\s+P2.*?\\nmodel\\s+${model}\\s+\\{`, 'g');
    if (!regex.test(schema)) {
      console.log(`FAIL: P2 model ${model} missing @phase P2 comment`);
    }
  }

  for (const model of phase3Tables) {
    const regex = new RegExp(`//\\s*@phase\\s+P3.*?\\nmodel\\s+${model}\\s+\\{`, 'g');
    if (!regex.test(schema)) {
      console.log(`FAIL: P3 model ${model} missing @phase P3 comment`);
    }
  }

  const p1Counts = await Promise.all(phase1Tables.map(async m => {
    // lowercase first letter
    const prop = m.charAt(0).toLowerCase() + m.slice(1);
    try {
      const count = await (prisma as any)[prop].count();
      return { model: m, count };
    } catch(e) {
      return { model: m, count: -1, error: e.message };
    }
  }));

  console.log("P1 Counts:", p1Counts);

  const p2Counts = await Promise.all(phase2Tables.map(async m => {
    const prop = m.charAt(0).toLowerCase() + m.slice(1);
    try {
      const count = await (prisma as any)[prop].count();
      return { model: m, count };
    } catch(e) {
      return { model: m, count: -1, error: e.message };
    }
  }));

  console.log("P2 Counts:", p2Counts);

  // Check audit_logs triggers
  const triggers = await prisma.$queryRaw`
    SELECT tgname FROM pg_trigger WHERE tgrelid = '"audit_logs"'::regclass;
  `;
  console.log("Triggers on audit_logs:", triggers);

  await prisma.$disconnect();
}

main().catch(console.error);
