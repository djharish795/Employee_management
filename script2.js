const fs = require('fs');

// Read schema.prisma.mine (which has Project, Sprint, TaskAction, etc.)
let schema = fs.readFileSync('packages/database/prisma/schema.prisma.mine', 'utf-8');

// Add CAM and OE to UserRole
schema = schema.replace(/enum UserRole \{[\s\S]*?\}/, (match) => {
    if (!match.includes('CAM')) {
        return match.replace(/}$/, '  CAM\n  OE\n}');
    }
    return match;
});

// Add onboardingSession to Employee
if (!schema.includes('onboardingSession')) {
    schema = schema.replace(/ktAssignments\s+OffboardingProcess\[\]\s+@relation\([\s\S]*?\)/, (match) => {
        return match + '\n  onboardingSession          OnboardingSession?';
    });
}

// Add metadata Json? to WorkflowInstance
if (!schema.includes('metadata Json?')) {
    schema = schema.replace(/model WorkflowInstance \{[\s\S]*?\}/, (match) => {
        return match.replace(/workflowId\s+String/, 'workflowId       String\n  metadata         Json?');
    });
}

// Append models
if (!schema.includes('model OnboardingSession')) {
    const models = `

model OnboardingSession {
  id              String           @id @default(cuid())
  employeeId      String           @unique
  stage           OnboardingStage  @default(HR_INTRODUCTION)
  startDate       DateTime
  expectedEndDate DateTime
  hrPartnerId     String
  buddyId         String?
  managerId       String
  isCompleted     Boolean          @default(false)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  employee        Employee         @relation(fields: [employeeId], references: [id])
  tasks           OnboardingTask[]
}

model OnboardingTask {
  id           String            @id @default(cuid())
  sessionId    String
  title        String
  description  String?
  dueDate      DateTime
  assignedTo   String
  isCompleted  Boolean           @default(false)
  completedAt  DateTime?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  session      OnboardingSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}

enum OnboardingStage {
  HR_INTRODUCTION
  MANAGER_INTRO
  TEAM_WELCOME
  DOCUMENTATION
  HARDWARE_SETUP
  SYSTEM_ACCESS
  TRAINING
  COMPLETED
}`;
    schema += models;
}

fs.writeFileSync('packages/database/prisma/schema.prisma', schema, 'utf-8');
console.log('Fixed schema');
