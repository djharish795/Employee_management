<<<<<<< HEAD
import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException, UnauthorizedException } from "@nestjs/common";
=======
import { Injectable, ConflictException, NotFoundException, ForbiddenException, BadRequestException, Logger } from "@nestjs/common";
>>>>>>> fc120ef7f0078f0d4d150b0d2015b2197b36efa3
import { PrismaService } from "../../prisma/prisma.service";
import { RbacService } from "../rbac/rbac.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { getPaginationOptions, createPaginatedResponse, PaginationParams, PaginatedResult } from "../../common/utils/pagination.util";
import { Employee, UserRole } from "@naprocs/database";
import { EmployeeResponseDto, mapToEmployeeResponseDto } from "./dto/employee-response.dto";
import { Permission } from "@naprocs/types";
import * as bcrypt from "bcrypt";
import { encryptData } from "../../common/utils/encrypt.util";
import { RedisService } from "../../redis/redis.service";
import { v4 as uuidv4 } from "uuid";
import { S3Client } from "@aws-sdk/client-s3";
import { createS3Client, generatePresignedDownloadUrl } from "../../common/utils/s3.util";

import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType } from "@naprocs/database";

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly rbacService: RbacService,
    private readonly notificationsService: NotificationsService
  ) {
    this.s3 = createS3Client();
    this.bucketName = (process.env.AWS_S3_BUCKET || "naprocs-ems-documents").trim();
  }

  /**
   * Helper to generate a pre-signed S3 URL for employee photos if a raw object key is present.
   */
  private async enrichWithSignedPhotoUrl(employee: any): Promise<void> {
    if (employee?.photoUrl && !employee.photoUrl.startsWith("http")) {
      try {
        employee.photoUrl = await generatePresignedDownloadUrl(this.s3, this.bucketName, employee.photoUrl);
      } catch (error) {
        this.logger.error(`Failed to sign photo URL for employee ${employee.id}:`, error);
      }
    }
  }

  async createEmployee(dto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
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

      await this.enrichWithSignedPhotoUrl(employee);

      return mapToEmployeeResponseDto(employee);
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

  async completeOnboarding(draftId: string): Promise<EmployeeResponseDto> {
    if (!draftId) throw new ConflictException("draftId is required");

    const redisKey = `employee_draft:${draftId}`;
    const draftData = await this.redis.getJson<any>(redisKey);

    if (!draftData) {
      throw new NotFoundException("Draft not found or expired");
    }

    // Transform draftData into CreateEmployeeDto if necessary, 
    // but we can pass it directly to createEmployee since it handles the DTO structure.
    const employee = await this.createEmployee(draftData as CreateEmployeeDto);

    // Delete the draft after successful creation
    await this.redis.del(redisKey);

    return employee;
  }

  async getEmployees(params: PaginationParams): Promise<PaginatedResult<EmployeeResponseDto>> {
    const { skip, take, page, limit } = getPaginationOptions(params);

    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({
        skip,
        take,
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
      this.prisma.employee.count(),
    ]);

    // Enhance employees with signed photo URLs
    await Promise.all(data.map(async (emp) => {
      await this.enrichWithSignedPhotoUrl(emp);
    }));

    return createPaginatedResponse(data.map(mapToEmployeeResponseDto), total, page, limit);
  }

  async getEmployeeById(id: string, currentUser?: any): Promise<EmployeeResponseDto> {
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

    await this.enrichWithSignedPhotoUrl(employee);

    const empWithRels = employee as any;
    
    const hasGlobalWrite = currentUser && currentUser.role && this.rbacService.hasPermission(currentUser.role, [Permission.WRITE_EMPLOYEES]);
    const isOwner = currentUser && currentUser.employeeId === id;
    if (!hasGlobalWrite && !isOwner) {
      delete empWithRels.aadhaar;
      delete empWithRels.pan;
      delete empWithRels.passport;
      delete empWithRels.bankAccountEnc;
      delete empWithRels.voterId;
      delete empWithRels.drivingLicence;
    }

    if (empWithRels.subordinates && empWithRels.subordinates.length > 0) {
      await Promise.all(empWithRels.subordinates.map((sub: any) => this.enrichWithSignedPhotoUrl(sub)));
    }

    return mapToEmployeeResponseDto(employee);
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

    await Promise.all(employees.map((emp) => this.enrichWithSignedPhotoUrl(emp)));

    return employees;
  }

  async getOrgStats() {
    const totalEmployees = await this.prisma.employee.count({ where: { status: "ACTIVE" } });
    const departmentsCount = await this.prisma.department.count();
    
    const managersResult = await this.prisma.employee.findMany({
      where: { status: "ACTIVE", reportingManagerId: { not: null } },
      select: { reportingManagerId: true },
      distinct: ['reportingManagerId']
    });
    const managersCount = managersResult.length;
    
    const openJobs = await this.prisma.job.findMany({ where: { status: "OPEN" } });
    const vacantCount = openJobs.reduce((acc, job) => acc + (job.openPositions - job.filledPositions), 0);
    
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

  async updateEmployee(id: string, dto: UpdateEmployeeDto, currentUser?: any): Promise<EmployeeResponseDto> {
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

    await this.enrichWithSignedPhotoUrl(updatedEmployee);

    // Trigger Notification for the updated employee
    try {
      await this.notificationsService.createNotification(
        updatedEmployee.id,
        "Profile Updated",
        "Your profile information has been updated by Human Resources or Management.",
        NotificationType.SYSTEM_ALERT
      );
    } catch (e) {
      this.logger.warn(`Failed to send update notification to employee ${updatedEmployee.id}: ${e}`);
    }

    return mapToEmployeeResponseDto(updatedEmployee);
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
      const cycleCheck = await this.prisma.$queryRaw<any[]>`
        WITH RECURSIVE chain AS (
          SELECT id, "reportingManagerId" 
          FROM "Employee" 
          WHERE id = ${newManagerId}
          UNION ALL
          SELECT e.id, e."reportingManagerId"
          FROM "Employee" e
          JOIN chain c ON c."reportingManagerId" = e.id
        )
        SELECT id FROM chain WHERE id = ${employeeId} OR "reportingManagerId" = ${employeeId} LIMIT 1
      `;
      if (cycleCheck.length > 0) {
        throw new ConflictException("Cannot assign a subordinate as a manager. This would create a circular reporting line.");
      }
    }
    
    await this.prisma.employee.update({
      where: { id: employeeId },
      data: { reportingManagerId: newManagerId || null }
    });

    try {
      await this.notificationsService.createNotification(
        employeeId,
        "Manager Reassigned",
        "Your reporting manager has been updated.",
        NotificationType.SYSTEM_ALERT
      );
    } catch (e) {
      this.logger.warn(`Failed to send manager reassignment notification to employee ${employeeId}: ${e}`);
    }
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
