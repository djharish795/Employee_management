const fs = require('fs');

// Read the clean 1241256 schema
let schema = fs.readFileSync('packages/database/prisma/schema.prisma', 'utf-8');

// Add TaskType additions if not present
if (!schema.includes('DAILY_TASK')) {
    schema = schema.replace(/enum TaskType \{[\s\S]*?\}/, 'enum TaskType {\n  STORY\n  TASK\n  BUG\n  EPIC\n  DAILY_TASK\n  WEEKLY_TASK_SHEET\n}');
}

// Add Sprint and SprintStatus if not present
if (!schema.includes('model Sprint')) {
    const sprintModel = '\n\nenum SprintStatus {\n  PLANNED\n  ACTIVE\n  COMPLETED\n}\n\nmodel Sprint {\n  id        String       @id @default(cuid())\n  name      String\n  startDate DateTime\n  endDate   DateTime\n  status    SprintStatus @default(PLANNED)\n  projectId String\n  createdAt DateTime     @default(now())\n  updatedAt DateTime     @updatedAt\n\n  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  tasks   Task[]\n\n  @@map("sprints")\n}';
    schema += sprintModel;
}

// Modify Task model
if (!schema.includes('sprintId')) {
    schema = schema.replace(/model Task \{[\s\S]*?\n\}/, (match) => {
        let task = match;
        task = task.replace(/title       String/, 'issueKey    String?      @unique\n  title       String');
        task = task.replace(/priority    TaskPriority @default\(MEDIUM\)/, 'priority    TaskPriority @default(MEDIUM)\n  type        TaskType     @default(TASK)');
        task = task.replace(/meetRequestId String\?/, 'reporterId    String?\n  meetRequestId String?\n  projectId     String?\n  sprintId      String?');
        task = task.replace(/meetRequest MeetRequest\? @relation/, 'reporter    Employee?    @relation("TaskReporter", fields: [reporterId], references: [id])\n  meetRequest MeetRequest? @relation');
        task = task.replace(/@@index/, 'project     Project?     @relation(fields: [projectId], references: [id])\n  sprint      Sprint?      @relation(fields: [sprintId], references: [id])\n\n  @@index');
        task = task.replace(/@@index\(\[projectId, status\]\)/, '');
        task = task.replace(/@@index\(\[assigneeId, status\]\)/, '@@index([assigneeId, status])\n  @@index([projectId, status])\n  @@index([sprintId])');
        return task;
    });
}
if (!schema.includes('reportedTasks')) {
    schema = schema.replace(/createdTasks\s+Task\[\]\s+@relation\("TaskCreator"\)/, 'createdTasks               Task[]                     @relation("TaskCreator")\n  reportedTasks              Task[]                     @relation("TaskReporter")');
}
fs.writeFileSync('packages/database/prisma/schema.prisma', schema, 'utf-8');
console.log('Fixed schema correctly');
