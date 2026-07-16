import { Injectable, Logger, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { encryptData, decryptData } from '../../common/utils/encrypt.util';
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
    const [upcomingJoiners, pendingDocuments, inProgress, completed30Days, cancelled, activeSessions] = await Promise.all([
      this.db.onboardingSession.count({ where: { stage: OnboardingStage.OFFER_ACCEPTED } }),
      this.db.onboardingSession.count({ where: { stage: OnboardingStage.DOCUMENTATION } }),
      this.db.onboardingSession.count({ where: { stage: { notIn: [OnboardingStage.COMPLETED, OnboardingStage.CANCELLED] } } }),
      this.db.onboardingSession.count({ 
        where: { 
          stage: OnboardingStage.COMPLETED,
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
        } 
      }),
      this.db.onboardingSession.count({ where: { stage: OnboardingStage.CANCELLED } }),
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
      where: { 
        assignedTo: 'HR', 
        isCompleted: false,
        session: { stage: { notIn: [OnboardingStage.CANCELLED, OnboardingStage.COMPLETED] } }
      },
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
      cancelled,
      pendingHrTasks,
      recentActivity
    };
  }

  async initiateOnboarding(data: any, actor: any, ipAddress: string) {
    this.logger.log(`Initiating onboarding for ${data.firstName} ${data.lastName}`);
    
    // Check if email already exists
    const existingUser = await this.db.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictException(`Email ${data.email} is already in use.`);
    }

    // Check for duplicate Aadhaar or PAN by decrypting existing records in memory
    if (data.aadhaar || data.pan) {
      const activeEmployees = await this.db.employee.findMany({
        where: { status: { in: ['ACTIVE', 'ONBOARDING', 'PROBATION'] } },
        select: { id: true, aadhaar: true, pan: true }
      });
      
      for (const emp of activeEmployees) {
        if (data.aadhaar && emp.aadhaar) {
          const decryptedAadhaar = decryptData(emp.aadhaar);
          if (decryptedAadhaar === data.aadhaar) {
            throw new ConflictException(`An employee profile with this Aadhaar number already exists.`);
          }
        }
        if (data.pan && emp.pan) {
          const decryptedPan = decryptData(emp.pan);
          if (decryptedPan === data.pan) {
            throw new ConflictException(`An employee profile with this PAN already exists.`);
          }
        }
      }
    }

    const DEPT_MAP: Record<string, string> = {
      "Engineering": "TR",
      "Product": "PR",
      "Design": "DS",
      "Sales": "SL",
      "HR": "HR"
    };
    const deptCode = DEPT_MAP[data.department] || "XX";
    const prefix = `NAP/${deptCode}/`;
    
    // 2. Look up Department ID
    const dept = data.department ? await this.db.department.findUnique({ where: { name: data.department } }) : null;
    const departmentId = dept?.id || null;

    // 3. Sanitize Phone and Encrypt PII
    const sanitizedPhone = data.phone ? data.phone.replace(/[^\d+]/g, '') : null;
    const encryptedAadhaar = data.aadhaar ? encryptData(data.aadhaar) : null;
    const encryptedPan = data.pan ? encryptData(data.pan) : null;
    const encryptedAccount = data.accountNo ? encryptData(data.accountNo) : null;
    const encryptedIfsc = data.ifsc ? encryptData(data.ifsc) : null;
    const encryptedPhone = sanitizedPhone ? encryptData(sanitizedPhone) : null;

    // 4. Generate User credentials
    const tempPassword = crypto.randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    let genderEnum = null;
    if (data.gender) {
      const g = data.gender.toUpperCase();
      if (['MALE', 'FEMALE', 'OTHER'].includes(g)) genderEnum = g;
      else if (data.gender === 'Prefer not to say') genderEnum = 'PREFER_NOT_TO_SAY';
    }

    let result;
    let retries = 0;
    while (retries < 5) {
      try {
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

        result = await this.db.$transaction(async (tx) => {
          const employee = await tx.employee.create({
            data: {
              employeeId: generatedEmployeeId,
              firstName: data.firstName,
              lastName: data.lastName,
              preferredName: data.preferredName || null,
              officialEmail: data.email,
              phone: encryptedPhone,
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

          // Create ConsentLog BEFORE saving PII (DPDPA compliance)
          await tx.consentLog.create({
            data: {
              employeeId: employee.id,
              collectedById: actor?.employeeId || employee.id, // Fallback if no actor
              purpose: "Onboarding Data Collection",
              ipAddress: ipAddress,
            }
          });

          const user = await tx.user.create({
            data: {
              email: data.email,
              passwordHash,
              employeeId: employee.id,
              role: 'EMPLOYEE',
              status: 'ACTIVE'
            }
          });

          const session = await tx.onboardingSession.create({
            data: {
              employeeId: employee.id,
              stage: OnboardingStage.OFFER_ACCEPTED,
              laptopType: data.laptopType,
              accessories: data.accessories || [],
              software: data.software || []
            }
          });

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

          await tx.auditLog.create({
            data: {
              action: "INITIATE_ONBOARDING",
              actorId: actor?.employeeId || "SYSTEM",
              resource: "OnboardingSession",
              resourceId: session.id,
              requestId: crypto.randomUUID()
            }
          });

          return { employee, tempPassword, session };
        });
        
        // Break out of retry loop on success
        break;
      } catch (err: any) {
        if (err.code === 'P2002' && err.meta?.target?.includes('employeeId')) {
          retries++;
          if (retries >= 5) throw new InternalServerErrorException("Failed to generate unique employee ID after 5 attempts");
          continue;
        }
        throw err;
      }
    }

    if (!result) {
      throw new InternalServerErrorException("Failed to create employee and initiate onboarding");
    }

    this.logger.log(`Created new employee ${result.employee.employeeId} with temporary password`);
    
    // Send Welcome Email with credentials
    await this.emailService.sendEmail(
      data.email, 
      `Welcome to Naprocs, ${data.firstName}!`,
      'welcome_credentials', 
      {
        employeeName: data.firstName,
        employeeId: result.employee.employeeId,
        password: result.tempPassword,
        loginUrl: `${process.env.FRONTEND_URL}/login` 
      }
    ).catch(err => {
      this.logger.error(`Failed to send welcome email to ${data.email}`, err);
    });
    
    return {
      success: true,
      message: 'Onboarding initiated successfully',
      employeeId: result.employee.employeeId,
      tempPassword: result.tempPassword 
    };
  }

  async getMySession(employeeId: string): Promise<any> {
    const session = await this.db.onboardingSession.findUnique({
      where: { employeeId },
      include: {
        employee: true,
        tasks: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      throw new NotFoundException('Onboarding session not found for this employee');
    }

    return session;
  }

  async submitDocument(employeeId: string, taskId: string, documentKey: string): Promise<any> {
    // S3 integration is on hold for now, so we just mock the document key update
    // We append the mock key to the description. HR will review and formally complete the task.
    const task = await this.db.onboardingTask.findUnique({
      where: { id: taskId },
      include: { session: true }
    });
    
    if (!task || task.session.employeeId !== employeeId) {
      throw new NotFoundException('Task not found or does not belong to you');
    }

    return this.db.onboardingTask.update({
      where: { id: taskId },
      data: { description: `Document uploaded: ${documentKey}` }
    });
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
      throw new NotFoundException(`Session ${id} not found`);
    }

    return session;
  }

  async toggleTaskStatus(taskId: string, isCompleted: boolean, actor: any): Promise<any> {
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

      await tx.auditLog.create({
        data: {
          action: isCompleted ? "COMPLETE_TASK" : "REOPEN_TASK",
          actorId: actor?.employeeId,
          resource: "OnboardingTask",
          resourceId: taskId,
          requestId: crypto.randomUUID()
        }
      });
    });
    
    return task;
  }

  async toggleAssignedTaskStatus(taskId: string, isCompleted: boolean, actor: any): Promise<any> {
    const task = await this.db.onboardingTask.findUnique({ where: { id: taskId }, include: { session: true } });
    if (!task) throw new NotFoundException('Task not found');

    const roleMatches = (actor.role === task.assignedTo.toUpperCase());
    const isOwner = (task.assignedTo === 'Employee' && actor.employeeId === task.session.employeeId);
    if (!roleMatches && !isOwner) {
      throw new ConflictException(`You do not have permission to toggle ${task.assignedTo} tasks`);
    }

    return this.toggleTaskStatus(taskId, isCompleted, actor);
  }

  async sendReminders(sessionId: string): Promise<void> {
    const session = await this.db.onboardingSession.findUnique({
      where: { id: sessionId },
      include: { tasks: true, employee: true }
    });
    if (!session) throw new NotFoundException('Session not found');

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
    if (!session) throw new NotFoundException('Session not found');

    const title = `Welcome Call: ${session.employee.firstName} ${session.employee.lastName}`;
    const description = `Welcome call for new joiner ${session.employee.firstName}`;
    
    const meetDetails = await this.zoomService.createMeetEvent(title, description, new Date(startTime), new Date(endTime));

    // Save event ID in an onboarding task so we can cancel it later if needed
    await this.db.onboardingTask.create({
      data: {
        sessionId: session.id,
        title: 'Welcome Call Event ID',
        description: meetDetails.eventId,
        assignedTo: 'SYSTEM',
        isCompleted: false,
      }
    });

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

  async cancelOnboarding(sessionId: string, actor: any): Promise<void> {
    const session = await this.db.onboardingSession.findUnique({
      where: { id: sessionId },
      include: { tasks: true }
    });
    if (!session) throw new NotFoundException('Session not found');

    // Cancel zoom meeting if scheduled
    const welcomeTask = session.tasks.find(t => t.title === 'Welcome Call Event ID');
    if (welcomeTask && welcomeTask.description) {
      await this.zoomService.cancelMeetEvent(welcomeTask.description).catch(err => {
        this.logger.warn(`Failed to cancel zoom meet: ${err}`);
      });
    }

    await this.db.$transaction(async (tx) => {
      await tx.onboardingSession.update({
        where: { id: session.id },
        data: { stage: OnboardingStage.CANCELLED }
      });

      await tx.employee.update({
        where: { id: session.employeeId },
        data: { status: EmployeeStatus.CANCELLED }
      });

      await tx.user.updateMany({
        where: { employeeId: session.employeeId },
        data: { status: 'SUSPENDED' }
      });

      await tx.auditLog.create({
        data: {
          action: "CANCEL_ONBOARDING",
          actorId: actor?.employeeId,
          resource: "OnboardingSession",
          resourceId: session.id,
          requestId: crypto.randomUUID()
        }
      });
    });
  }
}
