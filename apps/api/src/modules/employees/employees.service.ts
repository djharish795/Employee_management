import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException, UnauthorizedException, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RbacService } from "../rbac/rbac.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { EmployeeIdParamDto, EmployeeFilterDto } from "./dto/employee-params.dto";
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

// Ops-tier roles (OM/CRM/CEM/OE) are spec'd as "same as a regular employee" — they
// hold READ_EMPLOYEES for directory purposes only and must not bypass PII sanitization
// the way genuine org-wide roles (HR/CHRO/SUPER_ADMIN/etc.) do.
const OPS_TIER_LIMITED_ROLES = ['OM', 'CRM', 'CEM', 'OE'];
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

  async getEmployees(params: EmployeeFilterDto, currentUser?: any): Promise<PaginatedResult<Employee>> {
    let { skip, take, page, limit } = getPaginationOptions(params);
    limit = Math.min(limit, 100);
    take = limit;
    skip = (page - 1) * limit;

    const whereClause: any = {};

    // IDOR protection (B-03): If currentUser doesn't have global read, scope to their team
    if (currentUser && currentUser.role) {
      const hasGlobal = this.rbacService.hasPermission(currentUser.role, [Permission.READ_EMPLOYEES]);
      const hasTeam = this.rbacService.hasPermission(currentUser.role, [Permission.READ_TEAM_PROFILES]);
      
      if (!hasGlobal && hasTeam) {
        whereClause.reportingManagerId = currentUser.employeeId;
      }
    }

    if (params.search) {
      whereClause.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { employeeId: { contains: params.search, mode: 'insensitive' } },
        { officialEmail: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.department) {
      whereClause.department = {
        name: params.department
      };
    }

    if (params.status) {
      whereClause.status = params.status;
    } else {
      whereClause.status = {
        notIn: ['ONBOARDING', 'EXITED', 'CANCELLED']
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        skip,
        take,
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          employeeId: true,
          firstName: true,
          lastName: true,
          officialEmail: true,
          photoUrl: true,
          status: true,
          reportingManagerId: true,
          workLocation: true,
          createdAt: true,
          updatedAt: true,
          department: {
            select: { id: true, name: true, code: true }
          },
          designation: {
            select: { id: true, title: true }
          },
          user: {
            select: { role: true }
          }
        }
      }),
      this.prisma.employee.count({
        where: whereClause
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

    return createPaginatedResponse(data as any, total, page, limit);
  }

  async getEmployeeById(id: string, currentUser?: any): Promise<Employee> {
    let employee = await this.prisma.employee.findUnique({
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
      employee = await this.prisma.employee.findFirst({
        where: { employeeId: id },
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
    }

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found.`);
    }

    // Ownership Validation
    if (currentUser && currentUser.role) {
      const hasGlobal = this.rbacService.hasPermission(currentUser.role, [Permission.READ_EMPLOYEES]);
      const hasOwn = this.rbacService.hasPermission(currentUser.role, [Permission.READ_OWN_PROFILE]);
      const hasTeam = this.rbacService.hasPermission(currentUser.role, [Permission.READ_TEAM_PROFILES]);

      let isSanitizedView = false;
      if (!hasGlobal) {
        if (hasOwn && currentUser.employeeId === id) {
          // OK
        } else if (hasTeam && employee.reportingManagerId === currentUser.employeeId) {
          // OK - Manager can view their direct subordinate
        } else {
          // Allow sanitized view for project team leads and directory access
          isSanitizedView = true;
        }
      }
    }

    // F-03: Strip sensitive data if requestor is only a Manager (not owner or HR)
    if (currentUser && currentUser.employeeId !== id && !['HR', 'SUPER_ADMIN', 'CHRO', 'CEO'].includes(currentUser.role)) {
      delete (employee as any).identityDocuments;
      delete (employee as any).documents;
    }

    // Inject Virtual SL for profile display and remove physical SL
    if (employee.leaveBalances) {
      const filteredBalances = employee.leaveBalances.filter((b: any) => b.leaveType?.code !== 'SL');
      const clBalance = filteredBalances.find((b: any) => b.leaveType?.code === 'CL');
      
      if (clBalance) {
        // Find the SL leave type to get its name/id
        const slBalanceObj = employee.leaveBalances.find((b: any) => b.leaveType?.code === 'SL');
        if (slBalanceObj) {
          filteredBalances.push({
            ...clBalance,
            id: 'virtual-sl',
            leaveTypeId: slBalanceObj.leaveTypeId,
            leaveType: slBalanceObj.leaveType
          });
        }
      }
      employee.leaveBalances = filteredBalances;
    }

    const empWithRels = employee as any;

    if (currentUser && currentUser.role) {
      // isSanitizedView is defined above
      const hasGlobal = this.rbacService.hasPermission(currentUser.role, [Permission.READ_EMPLOYEES]) && !OPS_TIER_LIMITED_ROLES.includes(currentUser.role);
      const hasOwn = this.rbacService.hasPermission(currentUser.role, [Permission.READ_OWN_PROFILE]);
      const hasTeam = this.rbacService.hasPermission(currentUser.role, [Permission.READ_TEAM_PROFILES]);

      const isSanitizedView = !hasGlobal && !(hasOwn && currentUser.employeeId === id) && !(hasTeam && employee.reportingManagerId === currentUser.employeeId);

      // Strip extensive data for sanitized view (Team Leads looking at bench, etc.)
      if (isSanitizedView) {
        delete empWithRels.personalEmail;
        delete empWithRels.phone;
        delete empWithRels.alternatePhone;
        delete empWithRels.emergencyContact;
        delete empWithRels.currentAddress;
        delete empWithRels.permanentAddress;
        delete empWithRels.leaveBalances;
        delete empWithRels.leaveRequestsMade;
        delete empWithRels.attendanceRecords;
        delete empWithRels.consentLogsAsSubject;
        delete empWithRels.reviewsAsSubject;
        delete empWithRels.salaryStructures;
        delete empWithRels.dateOfBirth;
        delete empWithRels.gender;
        delete empWithRels.maritalStatus;
        delete empWithRels.nationality;
        delete empWithRels.bloodGroup;
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

    const hasPayrollRead = currentUser && currentUser.role && this.rbacService.hasPermission(currentUser.role, [Permission.READ_PAYROLL]);
    const isOwner = currentUser && currentUser.employeeId === id;
    if (!hasPayrollRead && !isOwner) {
      delete empWithRels.aadhaar;
      delete empWithRels.pan;
      delete empWithRels.passport;
      delete empWithRels.bankAccountEnc;
      delete empWithRels.voterId;
      delete empWithRels.drivingLicence;
      delete empWithRels.bankName;
      delete empWithRels.bankBranch;
      delete empWithRels.bankIfsc;
      delete empWithRels.currentAddress;
      delete empWithRels.permanentAddress;
    }

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

  async getOrgChart(asOf?: string) {
    let whereClause: any = { status: "ACTIVE" };

    if (asOf) {
      const asOfDate = new Date(asOf);
      whereClause = {
        joiningDate: { lte: asOfDate },
        OR: [
          { exitDate: null },
          { exitDate: { gt: asOfDate } }
        ]
      };
    }

    const employees = await this.prisma.employee.findMany({
      where: whereClause,
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

    // EMS-SECURITY: (Phase 12) We strictly DO NOT sign 10,000 S3 URLs in a loop here.
    // AWS Crypto hashing (Signature V4) blocks the Node.js Event Loop.
    // Generating 10k signatures synchronously freezes the entire API for all users for 30s+ (CPU DoS).
    // The frontend will receive raw S3 keys and lazy-load avatars independently if needed.

    return employees;
  }

  async searchDirectory(query: string) {
    if (!query || query.trim().length === 0) return [];

    const employees = await this.prisma.employee.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { designation: { title: { contains: query, mode: "insensitive" } } },
          { department: { name: { contains: query, mode: "insensitive" } } }
        ]
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        officialEmail: true,
        photoUrl: true,
        department: { select: { name: true } },
        designation: { select: { title: true } }
      },
      take: 10
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
          console.error(`Failed to sign URL for search directory emp ${emp.id}:`, e);
        }
      }
    }

    return employees;
  }

  async getOrgStats() {
    const totalEmployees = await this.prisma.employee.count({ where: { status: "ACTIVE" } });
    const departmentsCount = await this.prisma.department.count();

    const openJobs = await this.prisma.job.findMany({ where: { status: "OPEN" } });
    const vacantCount = openJobs.reduce((acc, job) => acc + (job.openPositions - job.filledPositions), 0);

    const deps = await this.prisma.department.findMany({
      include: { _count: { select: { employees: { where: { status: "ACTIVE" } } } } }
    });
    const breakdown = deps.map(d => ({
      name: d.name,
      count: d._count.employees,
      percentage: totalEmployees > 0 ? Math.round((d._count.employees / totalEmployees) * 100) : 0
    })).filter(d => d.count > 0);

    // Fetch all active employees to categorize them accurately
    // EMS-SECURITY: (Phase 12) We strictly DO NOT use `include` for massive tables like users and subordinates.
    // Downloading 10,000 nested employee relations takes 100MB+ of RAM. 10 users requesting this = 1GB RAM = OOM Crash.
    // Instead, we select ONLY the required primitive fields (taking <1MB total) and compute subordinates using a Set.
    const activeEmployees = await this.prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        reportingManagerId: true,
        user: { select: { role: true } },
        designation: { select: { title: true } }
      }
    });

    // Compute managers extremely efficiently in O(N) time without nested SQL queries
    const managerIds = new Set<string>();
    for (const emp of activeEmployees) {
      if (emp.reportingManagerId) {
        managerIds.add(emp.reportingManagerId);
      }
    }

    let cLevel = 0;
    let directors = 0;
    let managers = 0;
    let individualContributors = 0;
    let managersCount = managerIds.size;
    let subordinatesCount = 0;

    for (const emp of activeEmployees) {
      const hasSubordinates = managerIds.has(emp.id);
      
      if (emp.reportingManagerId) {
        subordinatesCount++;
      }

      const role = emp.user?.role;
      const title = (emp.designation?.title || "").toLowerCase();

      if (role && ["CEO", "CTO", "CHRO", "CFO"].includes(role)) {
        cLevel++;
      } else if (role === "OPERATIONS_HEAD" || title.includes("director") || title.includes("vp")) {
        directors++;
      } else if (hasSubordinates || (role && ["HR", "MANAGER"].includes(role))) {
        managers++;
      } else {
        individualContributors++;
      }
    }

    const avgSpanOfControl = managersCount > 0 ? (subordinatesCount / managersCount).toFixed(1) : "0";

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
    // Prevent mass assignment for self-updates (B-02)
    if (currentUser && currentUser.employeeId === id && !['HR', 'SUPER_ADMIN', 'CHRO', 'CEO'].includes(currentUser.role)) {
      delete (dto as any).departmentId;
      delete (dto as any).reportingManagerId;
      delete (dto as any).status;
      delete (dto as any).designationId;
      delete (dto as any).dateOfJoining;
      delete (dto as any).officialEmail;
    }

    // Verify the employee exists (also validates read access if we pass currentUser)
    const employee = await this.getEmployeeById(id, currentUser);

    // Ownership Validation for Write
    if (currentUser && currentUser.role) {
      let hasGlobal = this.rbacService.hasPermission(currentUser.role, [Permission.WRITE_EMPLOYEES]);
      const hasOwn = this.rbacService.hasPermission(currentUser.role, [Permission.WRITE_OWN_PROFILE]);

      // Enforce dynamic CEO edit policy
      if (currentUser.role === 'CEO' && currentUser.employeeId !== id) {
        const policy = await this.prisma.orgPolicy.findFirst();
        if (!policy?.ceoCanEditEmployeeDetails) {
          hasGlobal = false;
        }
      }

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

    // Prevent cyclic management loops
    if (dto.reportingManagerId && dto.reportingManagerId !== employee.reportingManagerId) {
      if (dto.reportingManagerId === id) {
        throw new ConflictException("An employee cannot be their own manager.");
      }
      
      const newManager = await this.prisma.employee.findUnique({ where: { id: dto.reportingManagerId } });
      if (!newManager) throw new NotFoundException("New manager not found.");

      let currentManagerId: string | null = newManager.reportingManagerId;
      const visited = new Set<string>();
      visited.add(dto.reportingManagerId);

      while (currentManagerId) {
        if (currentManagerId === id) {
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
        firstName: { not: 'Vacant' },
        department: {
          name: {
            in: ['Engineering', 'Technology', 'IT', 'Product', 'QA', 'Architecture', 'Software Development', 'Quality Assurance']
          }
        }
      },
      include: {
        department: true,
        designation: true,
        projectAssignments: {
          where: {
            project: { status: 'ACTIVE' }
          },
          include: {
            project: true
          }
        }
      },
      orderBy: { firstName: 'asc' }
    });

    let engineers = employees.map(e => {
      // Calculate real experience (tenure in years)
      let experience = 0;
      if (e.joiningDate) {
        const now = new Date();
        const years = (now.getTime() - e.joiningDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        experience = Math.max(0, Number(years.toFixed(1)));
      }

      // Determine subteam based on designation or default
      const title = (e.designation?.title || '').toLowerCase();
      const deptName = (e.department?.name || 'Unassigned').toLowerCase();

      let subTeam = e.department?.name || 'Unassigned';
      if (deptName.includes('eng') || deptName.includes('software') || deptName.includes('tech')) {
        if (title.includes('front')) subTeam = 'Frontend';
        else if (title.includes('full stack') || title.includes('fullstack')) subTeam = 'Full Stack';
        else if (title.includes('devops')) subTeam = 'DevOps';
        else if (title.includes('qa') || title.includes('test') || title.includes('quality')) subTeam = 'QA';
        else if (title.includes('mobile') || title.includes('ios') || title.includes('android')) subTeam = 'Mobile';
        else if (title.includes('architect')) subTeam = 'Architecture';
        else if (title.includes('ai') || title.includes('automation')) subTeam = 'AI Automation';
        else subTeam = 'Backend';
      }

      return {
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        initials: `${e.firstName.charAt(0)}${e.lastName.charAt(0)}`,
        subTeam,
        designation: e.designation?.title || 'Software Engineer',
        experience,
        status: 'Active',
        projects: (e.projectAssignments || []).map(pa => ({
          id: pa.project?.id,
          name: pa.project?.name,
          role: pa.projectRole
        })).filter(p => p.id)
      };
    });

    // Exclude executives/heads from the assignable bench
    engineers = engineers.filter(e => {
      const title = e.designation.toLowerCase();
      return !title.includes('chief') && !title.includes('cto') && !title.includes('ceo') && !title.includes('head');
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

  async getTodaysBirthdays() {
    const activeEmployees = await this.prisma.employee.findMany({
      where: { status: 'ACTIVE', dateOfBirth: { not: null } },
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        photoUrl: true, 
        dateOfBirth: true, 
        department: { select: { name: true } }, 
        designation: { select: { title: true } } 
      }
    });
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    const birthdays = activeEmployees.filter(emp => {
      if (!emp.dateOfBirth) return false;
      const dob = new Date(emp.dateOfBirth);
      return dob.getMonth() === currentMonth && dob.getDate() === currentDay;
    });

    return birthdays.map(emp => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      photoUrl: emp.photoUrl,
      department: emp.department?.name,
      designation: emp.designation?.title
    }));
  }
}
