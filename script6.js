const fs = require('fs');

// Read the clean 1241256 schema
let schema = fs.readFileSync('packages/database/prisma/schema.prisma', 'utf-8');

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

// Append EXACT 1241256 models
if (!schema.includes('model OnboardingSession')) {
    const models = `

model OnboardingSession {
  id          String          @id @default(cuid())
  employeeId  String          @unique
  stage       OnboardingStage @default(OFFER_ACCEPTED)
  laptopType  String?
  accessories Json?           @default("[]")
  software    Json?           @default("[]")
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  employee Employee         @relation(fields: [employeeId], references: [id])
  tasks    OnboardingTask[]

  @@map("onboarding_sessions")
}

model OnboardingTask {
  id          String    @id @default(cuid())
  sessionId   String
  title       String
  description String?
  isCompleted Boolean   @default(false)
  assignedTo  String
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  session OnboardingSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@map("onboarding_tasks")
}

enum OnboardingStage {
  OFFER_ACCEPTED
  DOCUMENTATION
  ASSET_ALLOCATION
  TRAINING
  MANAGER_INTRO
  COMPLETED
}`;
    schema += models;
}

fs.writeFileSync('packages/database/prisma/schema.prisma', schema, 'utf-8');
console.log('Fixed schema correctly');
