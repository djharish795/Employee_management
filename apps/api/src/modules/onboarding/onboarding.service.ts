import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { encryptData } from '../../common/utils/encrypt.util';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmployeeStatus, OnboardingStage } from '@naprocs/database';
import { EmailService } from '../notifications/email.service';
import { ZoomService } from '../connect/zoom.service';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly emailService: EmailService,
    private readonly zoomService: ZoomService
  ) {}

  async getDashboardMetrics(): Promise<any> {
    const [upcomingJoiners, pendingDocuments, inProgress, completed30Days, activeSessions] = await Promise.all([
      this.db.onboardingSession.count({ where: { stage: OnboardingStage.OFFER_ACCEPTED } }),
      this.db.onboardingSession.count({ where: { stage: OnboardingStage.DOCUMENTATION } }),
      this.db.onboardingSession.count({ where: { stage: { notIn: [OnboardingStage.COMPLETED] } } }),
      this.db.onboardingSession.count({ 
        where: { 
          stage: OnboardingStage.COMPLETED,
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
        } 
      }),
      this.db.onboardingSession.findMany({
        where: { stage: { notIn: [OnboardingStage.COMPLETED] } },
        include: { employee: true, tasks: true },
        orderBy: { createdAt: 'desc' },
        take: 4
      })
    ]);

    const pipeline = {
      offerAccepted: await this.db.onboardingSession.count({ where: { stage: OnboardingStage.OFFER_ACCEPTED } }),
      documentation: await this.db.onboardingSession.count({ where: { stage: OnboardingStage.DOCUMENTATION } }),
      assetAllocation: await this.db.onboardingSession.count({ where: { stage: OnboardingStage.ASSET_ALLOCATION } }),
      training: await this.db.onboardingSession.count({ where: { stage: OnboardingStage.TRAINING } }),
      managerIntro: await this.db.onboardingSession.count({ where: { stage: OnboardingStage.MANAGER_INTRO } }),
    };

    const pendingHrTasks = await this.db.onboardingTask.findMany({
      where: { assignedTo: 'HR', isCompleted: false },
      include: {
        session: {
          include: { employee: true }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: 5
    });

    const recentActivity = await this.db.auditLog.findMany({
      where: {
        resource: { in: ['OnboardingSession', 'Employee', 'OnboardingTask'] }
      },
      include: { actor: true },
      orderBy: { performedAt: 'desc' },
      take: 5
    });

    return {
      upcomingJoiners,
      upcomingJoinersThisWeek: upcomingJoiners, // Simplified for now
      pendingDocuments,
      inProgress,
      completed30Days,
      pipeline,
      activeOnboarding: activeSessions,
      pendingHrTasks,
      recentActivity
    };
  }

  async initiateOnboarding(data: any) {
    this.logger.log(`Initiating onboarding for ${data.firstName} ${data.lastName}`);
    
    // Check if email already exists
    const existingUser = await this.db.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictException(`Email ${data.email} is already in use.`);
    }

    // 1. Generate Employee ID based on department mapping
    const DEPT_MAP: Record<string, string> = {
      "Engineering": "TR",
      "Product": "PR",
      "Design": "DS",
      "Sales": "SL",
      "HR": "HR"
    };
    const deptCode = DEPT_MAP[data.department] || "XX";
    const prefix = `NAP/${deptCode}/`;
    
    const latestEmployee = await this.db.employee.findFirst({
      where: { employeeId: { startsWith: prefix } },
      orderBy: { employeeId: 'desc' }
    });

    let nextNumber = 1;
    if (latestEmployee) {
      const parts = latestEmployee.employeeId.split('/');
      if (parts.length === 3) {
        const lastNumber = parseInt(parts[2], 10);
        if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
      }
    }
    const generatedEmployeeId = `${prefix}${nextNumber.toString().padStart(3, '0')}`;

    // 2. Look up Department ID
    const dept = data.department ? await this.db.department.findUnique({ where: { name: data.department } }) : null;
    const departmentId = dept?.id || null;

    // 3. Encrypt PII
    const encryptedAadhaar = data.aadhaar ? encryptData(data.aadhaar) : null;
    const encryptedPan = data.pan ? encryptData(data.pan) : null;
    const encryptedAccount = data.accountNo ? encryptData(data.accountNo) : null;
    const encryptedIfsc = data.ifsc ? encryptData(data.ifsc) : null;

    // 4. Generate User credentials
    const tempPassword = crypto.randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Map Gender enum
    let genderEnum = null;
    if (data.gender) {
      const g = data.gender.toUpperCase();
      if (['MALE', 'FEMALE', 'OTHER'].includes(g)) genderEnum = g;
      else if (data.gender === 'Prefer not to say') genderEnum = 'PREFER_NOT_TO_SAY';
    }

    // 5. Create Employee, User, OnboardingSession in a transaction
    const result = await this.db.$transaction(async (tx) => {
      // Create Employee
      const employee = await tx.employee.create({
        data: {
          employeeId: generatedEmployeeId,
          firstName: data.firstName,
          lastName: data.lastName,
          preferredName: data.preferredName || null,
          officialEmail: data.email, // Using provided email as official for now
          alternatePhone: data.phone,
          departmentId: departmentId,
          aadhaar: encryptedAadhaar,
          pan: encryptedPan,
          bankAccountEnc: encryptedAccount,
          bankIfsc: encryptedIfsc,
          dateOfBirth: data.dob ? new Date(data.dob) : null,
          gender: genderEnum as any,
          emergencyContact: (data.emergencyName || data.emergencyPhone) ? {
            name: data.emergencyName,
            relation: data.emergencyRelation,
            phone: data.emergencyPhone
          } : undefined,
          workLocation: data.location || null,
          joiningDate: data.joinDate ? new Date(data.joinDate) : null,
          backgroundVerified: data.bgvStatus === 'Completed',
          status: EmployeeStatus.ONBOARDING,
          employeeType: data.employmentType === 'Full-time' ? 'FULL_TIME' : 
                       (data.employmentType === 'Contract' ? 'CONTRACT' : 'INTERN'),
        }
      });

      // Create User
      await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          employeeId: employee.id,
          role: 'EMPLOYEE',
          status: 'ACTIVE'
        }
      });

      // Create Session
      const session = await tx.onboardingSession.create({
        data: {
          employeeId: employee.id,
          stage: OnboardingStage.OFFER_ACCEPTED,
          laptopType: data.laptopType,
          accessories: data.accessories || [],
          software: data.software || []
        }
      });

      // Create Tasks
      const defaultTasks = [
        { title: 'Verify I-9 Documents', assignedTo: 'HR' },
        { title: 'Assign Work Laptop', assignedTo: 'IT' },
        { title: 'Review Payroll Setup', assignedTo: 'Finance' },
        { title: 'Complete Compliance Training', assignedTo: 'Employee' }
      ];

      await tx.onboardingTask.createMany({
        data: defaultTasks.map(task => ({
          sessionId: session.id,
          title: task.title,
          description: '',
          assignedTo: task.assignedTo
        }))
      });

      return { employee, tempPassword, session };
    });

    this.logger.log(`Created new employee ${result.employee.employeeId} with temporary password`);
    
    return {
      success: true,
      message: 'Onboarding initiated successfully',
      employeeId: result.employee.employeeId,
      // We return it here so HR can see it (or send it via email).
      tempPassword: result.tempPassword 
    };
  }

  async getSessionDetails(id: string): Promise<any> {
    const session = await this.db.onboardingSession.findUnique({
      where: { id },
      include: {
        employee: true,
        tasks: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      throw new Error(`Session ${id} not found`);
    }

    return session;
  }

  async toggleTaskStatus(taskId: string, isCompleted: boolean): Promise<any> {
    const task = await this.db.onboardingTask.update({
      where: { id: taskId },
      data: { 
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    });

    // Auto-advance the pipeline stage
    const sessionTasks = await this.db.onboardingTask.findMany({ where: { sessionId: task.sessionId } });
    const total = sessionTasks.length;
    const completed = sessionTasks.filter(t => t.isCompleted).length;
    
    let nextStage: OnboardingStage = OnboardingStage.OFFER_ACCEPTED;
    if (completed === total && total > 0) {
      nextStage = OnboardingStage.COMPLETED;
    } else if (completed > 0) {
      const stages = [
        OnboardingStage.DOCUMENTATION,
        OnboardingStage.ASSET_ALLOCATION,
        OnboardingStage.TRAINING,
        OnboardingStage.MANAGER_INTRO
      ];
      const stageIndex = Math.min(completed - 1, stages.length - 1);
      nextStage = stages[stageIndex];
    }
    
    await this.db.$transaction(async (tx) => {
      await tx.onboardingSession.update({
        where: { id: task.sessionId },
        data: { stage: nextStage }
      });
      
      if (nextStage === OnboardingStage.COMPLETED) {
        const session = await tx.onboardingSession.findUnique({ where: { id: task.sessionId } });
        if (session) {
          await tx.employee.update({
            where: { id: session.employeeId },
            data: { status: EmployeeStatus.ACTIVE }
          });
        }
      }
    });
    
    return task;
  }

  async sendReminders(sessionId: string): Promise<void> {
    const session = await this.db.onboardingSession.findUnique({
      where: { id: sessionId },
      include: { tasks: true, employee: true }
    });
    if (!session) throw new Error('Session not found');

    const pendingTasks = session.tasks.filter(t => !t.isCompleted);
    if (pendingTasks.length === 0) return;

    const assignees = new Set(pendingTasks.map(t => t.assignedTo));
    for (const assignee of assignees) {
      const emailTo = assignee === 'EMPLOYEE' ? session.employee.officialEmail : `${assignee.toLowerCase()}@naprocs.in`;
      const tasksForAssignee = pendingTasks.filter(t => t.assignedTo === assignee);
      
      await this.emailService.sendEmail(
        emailTo,
        `Reminder: Pending Onboarding Tasks for ${session.employee.firstName}`,
        'onboarding_reminder',
        {
          employeeName: session.employee.firstName,
          tasks: tasksForAssignee.map(t => t.title)
        }
      );
    }
  }

  async scheduleWelcomeCall(sessionId: string, startTime: Date, endTime: Date): Promise<void> {
    const session = await this.db.onboardingSession.findUnique({
      where: { id: sessionId },
      include: { employee: true }
    });
    if (!session) throw new Error('Session not found');

    const title = `Welcome Call: ${session.employee.firstName} ${session.employee.lastName}`;
    const description = `Welcome call for new joiner ${session.employee.firstName}`;
    
    const meetDetails = await this.zoomService.createMeetEvent(title, description, new Date(startTime), new Date(endTime));

    await this.emailService.sendEmail(
      session.employee.officialEmail,
      `Scheduled: Welcome Call`,
      'welcome_call_invite',
      {
        employeeName: session.employee.firstName,
        meetLink: meetDetails.meetLink,
        startTime: startTime,
      }
    );
  }

  async cancelOnboarding(sessionId: string): Promise<void> {
    await this.db.$transaction(async (tx) => {
      const session = await tx.onboardingSession.findUnique({
        where: { id: sessionId },
      });
      if (!session) throw new Error('Session not found');

      await tx.employee.update({
        where: { id: session.employeeId },
        data: { status: EmployeeStatus.EXITED }
      });

      await tx.user.updateMany({
        where: { employeeId: session.employeeId },
        data: { status: 'SUSPENDED' }
      });
    });
  }
}
