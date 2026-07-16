import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException, UnauthorizedException, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RbacService } from "../rbac/rbac.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { getPaginationOptions, createPaginatedResponse, PaginationParams, PaginatedResult } from "../../common/utils/pagination.util";
import { Employee, UserRole } from "@naprocs/database";
import { Permission } from "@naprocs/types";
import * as bcrypt from "bcrypt";
import { encryptData } from "../../common/utils/encrypt.util";
import { RedisService } from "../../redis/redis.service";
import { v4 as uuidv4 } from "uuid";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createS3Client } from "../../common/utils/s3.util";

import { NotificationsService } from "../notifications/notifications.service";
import { EmailService } from "../notifications/email.service";
import { NotificationType, EmployeeStatus } from "@naprocs/database";
import * as crypto from "crypto";

@Injectable()
export class EmployeesService {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly rbacService: RbacService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService
  ) {
    this.s3 = createS3Client();
    this.bucketName = (process.env.AWS_S3_BUCKET || "naprocs-ems-documents").trim();
  }

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Check uniqueness of officialEmail
      const existingEmail = await tx.employee.findUnique({
        where: { officialEmail: dto.officialEmail },
      });

      if (existingEmail) {
        throw new ConflictException("An employee with this official email already exists.");
      }

      if (dto.designationId) {
        const designation = await tx.designation.findUnique({
          where: { id: dto.designationId }
        });
        if (!designation) {
          throw new NotFoundException(`Designation with ID ${dto.designationId} not found.`);
        }
        if (designation.departmentId !== dto.departmentId) {
          throw new ConflictException("The selected designation does not belong to the selected department.");
        }
      }

      // Extract non-employee fields including resourceType
      const { password, role, bankAccount, resourceType, ...rawEmployeeData } = dto;

      // 2. Generate employeeId (NPR/<RESOURCE_TYPE>/<SEQUENCE> format)
      const resType = resourceType || "TR"; // Default to TR if not provided
      const idPrefix = `NPR/${resType}/`;

      const lastEmployee = await tx.employee.findFirst({
        where: { employeeId: { startsWith: idPrefix } },
        orderBy: { createdAt: "desc" },
        select: { employeeId: true },
      });

      let nextIdNumber = 1;
      if (lastEmployee && lastEmployee.employeeId.startsWith(idPrefix)) {
        const lastIdNumStr = lastEmployee.employeeId.replace(idPrefix, "");
        const lastIdNum = parseInt(lastIdNumStr, 10);
        if (!isNaN(lastIdNum)) {
          nextIdNumber = lastIdNum + 1;
        }
      }

      // Sequence starts from 001
      const employeeId = `${idPrefix}${nextIdNumber.toString().padStart(3, "0")}`;

      // Clean up empty strings, format dates, and uppercase enums
      const employeeData: any = {};
      for (const [key, value] of Object.entries(rawEmployeeData)) {
        if (value === "" || value === null || value === undefined) {
          continue; // Skip empty fields so Prisma uses defaults or null
        }

        // Format dates
        if ((key === "dateOfBirth" || key === "joiningDate") && typeof value === "string") {
          employeeData[key] = new Date(value).toISOString();
        }
        // Uppercase enums
        else if (key === "gender" || key === "maritalStatus" || key === "employeeType" || key === "status") {
          employeeData[key] = typeof value === "string" ? value.toUpperCase() : value;
        }
        else {
          employeeData[key] = value;
        }
      }

      // Remove fields not in Prisma schema that might have leaked from frontend drafts
      const allowedPrismaFields = [
        "firstName", "lastName", "middleName", "preferredName", "officialEmail", "personalEmail",
        "phone", "alternatePhone", "photoUrl", "dateOfBirth", "gender", "bloodGroup", "nationality",
        "maritalStatus", "currentAddress", "permanentAddress", "emergencyContact", "aadhaar", "pan",
        "passport", "drivingLicence", "voterId", "bankName", "bankBranch", "bankIfsc", "paymentMode",
        "paymentFrequency", "accountType", "documents", "departmentId", "designationId", "status",
        "joiningDate", "employeeType", "grade", "band", "workLocation", "reportingManagerId"
      ];

      const cleanData: any = {};
      for (const key of allowedPrismaFields) {
        if (employeeData[key] !== undefined) {
          cleanData[key] = employeeData[key];
        }
      }

      // 3. Create the employee record
      const employee = await tx.employee.create({
        data: {
          employeeId,
          ...cleanData,
          bankAccountEnc: bankAccount ? encryptData(bankAccount) : undefined,
        },
      });

      // 4. Create User record if password is provided
      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        await tx.user.create({
          data: {
            email: employeeData.officialEmail,
            passwordHash,
            role: (role as UserRole) || UserRole.EMPLOYEE,
            employeeId: employee.id,
          }
        });
      }

      if (employee.photoUrl && !employee.photoUrl.startsWith("http")) {
        try {
          const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: employee.photoUrl,
          });
          employee.photoUrl = await getSignedUrl(this.s3, command, { expiresIn: 900 });
        } catch (error) {
          console.error(`Failed to sign URL for employee ${employee.id}:`, error);
        }
      }

      return employee;
    });
  }

  async saveOnboardingStep(draftId: string, stepNumber: string, payload: any): Promise<{ draftId: string }> {
    const id = draftId || uuidv4();
    const redisKey = `employee_draft:${id}`;

    // Fetch existing draft
    const existingDraft = await this.redis.getJson<any>(redisKey) || {};

    // Merge new step data
    const updatedDraft = {
      ...existingDraft,
      ...payload,
    };

    // Save back to Redis with 24 hours expiry
    await this.redis.setJson(redisKey, updatedDraft, 60 * 60 * 24);

    return { draftId: id };
  }

  async getOnboardingDraft(draftId: string): Promise<any> {
    const redisKey = `employee_draft:${draftId}`;
    const draftData = await this.redis.getJson<any>(redisKey);
    return draftData || {};
  }

  async completeOnboarding(draftId: string, actor: any, ipAddress: string): Promise<Employee> {
    if (!draftId) throw new ConflictException("draftId is required");

    const redisKey = `employee_draft:${draftId}`;
    const draftData = await this.redis.getJson<any>(redisKey);

    if (!draftData) {
      throw new NotFoundException("Draft not found or expired");
    }

    // Force the status to ONBOARDING so they don't appear in the main directory yet
    draftData.status = "ONBOARDING";

    // Generate User credentials
    const tempPassword = crypto.randomBytes(6).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const employee = await this.createEmployee(draftData as CreateEmployeeDto);

    await this.prisma.$transaction(async (tx) => {
      // Create ConsentLog BEFORE saving PII (DPDPA compliance)
      await tx.consentLog.create({
        data: {
          employeeId: employee.id,
          collectedById: actor?.employeeId || employee.id, // Fallback if no actor
          purpose: "Onboarding Data Collection",
          ipAddress: ipAddress || "0.0.0.0",
        }
      });

      await tx.user.create({
        data: {
          email: employee.officialEmail,
          passwordHash,
          employeeId: employee.id,
          role: 'EMPLOYEE',
          status: 'ACTIVE'
        }
      });

      // Create onboarding session and default tasks
      await tx.onboardingSession.create({
        data: {
          employeeId: employee.id,
          tasks: {
            create: [
              { title: "Review Offer Letter", assignedTo: "HR", description: "Verify signed offer letter." },
              { title: "Collect Documents", assignedTo: "HR", description: "Collect identity and address proofs." },
              { title: "Assign IT Assets", assignedTo: "IT", description: "Allocate laptop and required accessories." },
              { title: "Schedule Manager Intro", assignedTo: "MANAGER", description: "Schedule a 1:1 with reporting manager." }
            ]
          }
        }
      });
    });

    // Send email asynchronously
    this.emailService.sendEmail(
      employee.officialEmail,
      "Welcome to Naprocs! Here are your credentials",
      "welcome_credentials",
      {
        firstName: employee.firstName,
        email: employee.officialEmail,
        password: tempPassword,
        loginUrl: `${process.env.FRONTEND_URL}/login`
      }
    ).catch(err => this.logger.error(`Failed to send welcome email to ${employee.officialEmail}`, err));

    // Delete the draft after successful creation
    await this.redis.del(redisKey);

    return employee;
  }

  async getEmployees(params: PaginationParams): Promise<PaginatedResult<Employee>> {
    const { skip, take, page, limit } = getPaginationOptions(params);

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        skip,
        take,
        where: {
          status: {
            not: 'ONBOARDING'
          }
        },
        orderBy: { createdAt: "desc" },
        include: {
          department: {
            select: { id: true, name: true, code: true }
          },
          designation: {
            select: { id: true, title: true }
          }
        }
      }),
      this.prisma.employee.count({
        where: {
          status: {
            not: 'ONBOARDING'
          }
        }
      }),
    ]);

    // Enhance employees with signed photo URLs
    for (const emp of data) {
      if (emp.photoUrl && !emp.photoUrl.startsWith("http")) {
        try {
          const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: emp.photoUrl,
          });
          emp.photoUrl = await getSignedUrl(this.s3, command, { expiresIn: 900 });
        } catch (error) {
          console.error(`Failed to sign URL for employee ${emp.id}:`, error);
        }
      }
    }

    return createPaginatedResponse(data, total, page, limit);
  }

  async getEmployeeById(id: string, currentUser?: any): Promise<Employee> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: {
          select: { id: true, name: true, code: true }
        },
        designation: {
          select: { id: true, title: true }
        },
        subordinates: {
          select: { id: true, employeeId: true, firstName: true, lastName: true, photoUrl: true, designation: { select: { title: true } } }
        },
        attendanceRecords: {
          orderBy: { date: 'desc' },
          take: 10
        },
        leaveBalances: {
          include: { leaveType: true }
        },
        leaveRequestsMade: {
          orderBy: { appliedAt: 'desc' },
          take: 5,
          include: { leaveType: true }
        },
        assetsHeld: true,
        consentLogsAsSubject: {
          orderBy: { consentedAt: 'desc' },
          take: 5
        }
      }
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found.`);
    }

    // Ownership Validation
    if (currentUser && currentUser.role) {
      const hasGlobal = this.rbacService.hasPermission(currentUser.role, [Permission.READ_EMPLOYEES]);
      const hasOwn = this.rbacService.hasPermission(currentUser.role, [Permission.READ_OWN_PROFILE]);
      const hasTeam = this.rbacService.hasPermission(currentUser.role, [Permission.READ_TEAM_PROFILES]);

      if (!hasGlobal) {
        if (hasOwn && currentUser.employeeId === id) {
          // OK
        } else if (hasTeam) {
          // OK - Manager can view any profile from the directory
        } else {
          throw new ForbiddenException("You do not have permission to view this employee profile.");
        }
      }
    }

    if (employee.photoUrl && !employee.photoUrl.startsWith("http")) {
      try {
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: employee.photoUrl,
        });
        employee.photoUrl = await getSignedUrl(this.s3, command, { expiresIn: 900 });
      } catch (error) {
        console.error(`Failed to sign URL for employee ${employee.id}:`, error);
      }
    }

    const empWithRels = employee as any;
    if (empWithRels.subordinates && empWithRels.subordinates.length > 0) {
      for (const sub of empWithRels.subordinates) {
        if (sub.photoUrl && !sub.photoUrl.startsWith("http")) {
          try {
            const subCommand = new GetObjectCommand({
              Bucket: this.bucketName,
              Key: sub.photoUrl,
            });
            sub.photoUrl = await getSignedUrl(this.s3, subCommand, { expiresIn: 900 });
          } catch (e) {
            console.error(`Failed to sign URL for sub ${sub.id}:`, e);
          }
        }
      }
    }

    return employee;
  }

  async getOrgChart() {
    const employees = await this.prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        officialEmail: true,
        photoUrl: true,
        gender: true,
        reportingManagerId: true,
        workLocation: true,
        department: { select: { name: true } },
        designation: { select: { title: true } }
      }
    });

    for (const emp of employees) {
      if (emp.photoUrl && !emp.photoUrl.startsWith("http")) {
        try {
          const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: emp.photoUrl,
          });
          emp.photoUrl = await getSignedUrl(this.s3, command, { expiresIn: 900 });
        } catch (e) {
          console.error(`Failed to sign URL for org chart emp ${emp.id}:`, e);
        }
      }
    }

    return employees;
  }

  async getOrgStats() {
    const totalCapacity = await this.prisma.employee.count();
    const totalEmployees = await this.prisma.employee.count({ where: { status: "ACTIVE" } });
    const vacantCount = totalCapacity - totalEmployees;
    
    const departmentsCount = await this.prisma.department.count();
    
    const managersResult = await this.prisma.employee.findMany({
      where: { status: "ACTIVE", reportingManagerId: { not: null } },
      select: { reportingManagerId: true },
      distinct: ['reportingManagerId']
    });
    const managersCount = managersResult.length;
    
    const avgSpanOfControl = managersCount > 0 ? (totalEmployees / managersCount).toFixed(1) : "0";

    const deps = await this.prisma.department.findMany({
      include: { _count: { select: { employees: { where: { status: "ACTIVE" } } } } }
    });
    const breakdown = deps.map(d => ({
      name: d.name,
      count: d._count.employees,
      percentage: totalEmployees > 0 ? Math.round((d._count.employees / totalEmployees) * 100) : 0
    })).filter(d => d.count > 0);

    const cLevel = await this.prisma.user.count({ where: { role: { in: ["CEO", "CTO", "CHRO"] } } });
    const directors = await this.prisma.user.count({ where: { role: "OPERATIONS_HEAD" } });
    const managers = await this.prisma.user.count({ where: { role: { in: ["HR", "MANAGER"] } } });
    const individualContributors = await this.prisma.user.count({ where: { role: "EMPLOYEE" } });

    // Dynamic Notifications
    const notifications: Array<{ title: string; message: string; type: string }> = [];
    
    // Check for manager vacancies (departments without a head)
    const departmentsWithoutHead = deps.filter(d => !d.headId);
    departmentsWithoutHead.forEach(d => {
      notifications.push({
        title: "Manager Vacancy",
        message: `${d.name} currently has no manager assigned.`,
        type: "warning"
      });
    });

    // Check for newly created departments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newDepartments = deps.filter(d => d.createdAt && d.createdAt >= sevenDaysAgo);
    newDepartments.forEach(d => {
      notifications.push({
        title: "New Department Created",
        message: `"${d.name}" was recently added to the organization structure.`,
        type: "info"
      });
    });

    return {
      totalEmployees,
      departments: departmentsCount,
      managers: managersCount,
      vacantPositions: vacantCount,
      avgSpanOfControl,
      breakdown,
      managementStructure: {
        cLevel,
        directors,
        managers,
        individualContributors
      },
      notifications
    };
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto, currentUser?: any): Promise<Employee> {
    // Verify the employee exists (also validates read access if we pass currentUser)
    const employee = await this.getEmployeeById(id, currentUser);

    // Ownership Validation for Write
    if (currentUser && currentUser.role) {
      const hasGlobal = this.rbacService.hasPermission(currentUser.role, [Permission.WRITE_EMPLOYEES]);
      const hasOwn = this.rbacService.hasPermission(currentUser.role, [Permission.WRITE_OWN_PROFILE]);

      if (!hasGlobal) {
        if (hasOwn && currentUser.employeeId === id) {
          // OK
        } else {
          throw new ForbiddenException("You do not have permission to update this employee profile.");
        }
      }
    }

    // If updating designation or department, ensure they match
    if (dto.designationId !== undefined || dto.departmentId !== undefined) {
      const targetDesignationId = dto.designationId !== undefined ? dto.designationId : employee.designationId;
      const targetDepartmentId = dto.departmentId !== undefined ? dto.departmentId : employee.departmentId;

      if (targetDesignationId) {
        const designation = await this.prisma.designation.findUnique({
          where: { id: targetDesignationId }
        });
        if (!designation) {
          throw new NotFoundException(`Designation with ID ${targetDesignationId} not found.`);
        }
        if (designation.departmentId !== targetDepartmentId) {
          throw new ConflictException("The selected designation does not belong to the selected department.");
        }
      }
    }

    // If updating official email, check uniqueness
    if (dto.officialEmail) {
      const existingEmail = await this.prisma.employee.findUnique({
        where: { officialEmail: dto.officialEmail },
      });

      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException("An employee with this official email already exists.");
      }
    }

    // Handle banking data encryption
    const { password, oldPassword, role, bankAccount, ...employeeData } = dto as any;
    const updateData: any = { ...employeeData };
    if (bankAccount !== undefined) {
      updateData.bankAccountEnc = bankAccount ? encryptData(bankAccount) : null;
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: updateData,
    });

    if (password) {
      const user = await this.prisma.user.findUnique({
        where: { employeeId: id }
      });
      
      if (!user) {
        throw new NotFoundException('User record not found for this employee.');
      }

      if (oldPassword) {
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isOldPasswordValid) {
          throw new UnauthorizedException('The old password provided is incorrect.');
        }
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await this.prisma.user.update({
        where: { employeeId: id },
        data: { passwordHash }
      });
    }

    if (updatedEmployee.photoUrl && !updatedEmployee.photoUrl.startsWith("http")) {
      try {
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: updatedEmployee.photoUrl,
        });
        updatedEmployee.photoUrl = await getSignedUrl(this.s3, command, { expiresIn: 900 });
      } catch (error) {
        console.error(`Failed to sign URL for employee ${updatedEmployee.id}:`, error);
      }
    }

    return updatedEmployee;
  }

  async reassignManager(employeeId: string, newManagerId: string): Promise<void> {
    if (employeeId === newManagerId) {
      throw new ConflictException("An employee cannot be their own manager.");
    }
    
    // Ensure both exist
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException("Employee not found.");
    
    if (newManagerId) {
      const manager = await this.prisma.employee.findUnique({ where: { id: newManagerId } });
      if (!manager) throw new NotFoundException("New manager not found.");

      // Prevent cyclic management: Check if the new manager already reports to this employee (directly or indirectly)
      let currentManagerId: string | null = manager.reportingManagerId;
      const visited = new Set<string>();
      visited.add(newManagerId);

      while (currentManagerId) {
        if (currentManagerId === employeeId) {
          throw new ConflictException("Cannot assign a subordinate as a manager. This would create a circular reporting line.");
        }
        if (visited.has(currentManagerId)) {
          break; // Break on existing cycle just in case
        }
        visited.add(currentManagerId);
        
        const currentManager = await this.prisma.employee.findUnique({ where: { id: currentManagerId } });
        if (!currentManager) break;
        currentManagerId = currentManager.reportingManagerId;
      }
    }
    
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { reportingManagerId: newManagerId || null }
    });
  }

  async getCtoTeam(): Promise<any> {
    const employees = await this.prisma.employee.findMany({
      where: { 
        status: 'ACTIVE',
      },
      include: {
        department: true,
        designation: true
      },
      orderBy: { firstName: 'asc' }
    });

    const engineers = employees.map(e => {
      // Calculate real experience (tenure in years)
      let experience = 0;
      if (e.joiningDate) {
        const now = new Date();
        const years = (now.getTime() - e.joiningDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        experience = Math.max(0, Number(years.toFixed(1)));
      }
      
      // Determine subteam based on designation or default
      const title = (e.designation?.title || '').toLowerCase();
      const deptName = e.department?.name || 'Unassigned';
      
      let subTeam = deptName;
      if (deptName.toLowerCase().includes('eng')) {
        if (title.includes('front')) subTeam = 'Frontend';
        else if (title.includes('devops')) subTeam = 'DevOps';
        else if (title.includes('qa') || title.includes('test')) subTeam = 'QA';
        else if (title.includes('mobile') || title.includes('ios') || title.includes('android')) subTeam = 'Mobile';
        else if (title.includes('architect')) subTeam = 'Architecture';
        else subTeam = 'Backend';
      }

      return {
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        initials: `${e.firstName.charAt(0)}${e.lastName.charAt(0)}`,
        subTeam,
        designation: e.designation?.title || 'Software Engineer',
        experience,
        status: 'Active'
      };
    });

    return {
      engineers,
      totalCount: engineers.length
    };
  }

  async deleteEmployee(id: string): Promise<void> {
    try {
      // Manually cascade delete onboarding session data to prevent FK constraint failures
      const onboardingSession = await this.prisma.onboardingSession.findUnique({ where: { employeeId: id } });
      if (onboardingSession) {
        await this.prisma.onboardingTask.deleteMany({ where: { sessionId: onboardingSession.id } });
        await this.prisma.onboardingSession.delete({ where: { employeeId: id } });
      }
      
      // Actually delete the employee
      await this.prisma.employee.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException("Cannot delete this employee because they have active records (Attendance, Leaves, Audit Logs, etc). Please 'Deactivate' the employee instead.");
      }
      throw error;
    }
  }
}
