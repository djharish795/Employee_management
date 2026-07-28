import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateWorkReportDto, ReportPriority } from './dto/create-work-report.dto';

export enum ReportStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVISION = 'NEEDS_REVISION'
}

@Injectable()
export class WorkReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  async create(employeeId: string, role: string, dto: CreateWorkReportDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { department: true }
    });

    if (!employee) throw new NotFoundException('Employee not found');

    let reviewerId = employee.reportingManagerId;
    
    if (role === 'OM' || role === 'CEM' || role === 'OPERATIONS_HEAD') {
      const ceoUser = await this.prisma.user.findFirst({
        where: { role: 'CEO', employeeId: { not: null } }
      });
      if (ceoUser && ceoUser.employeeId) {
        reviewerId = ceoUser.employeeId;
      }
    } else if (role === 'CRM' || role === 'OE') {
      let manager = await this.prisma.employee.findUnique({
        where: { id: reviewerId || '' },
        include: { user: true }
      });
      if (manager && manager.user?.role === 'OM') {
        reviewerId = manager.id;
      } else {
        const omUser = await this.prisma.user.findFirst({
          where: { role: 'OM', employeeId: { not: null } }
        });
        if (omUser && omUser.employeeId) {
          reviewerId = omUser.employeeId;
        } else {
          throw new BadRequestException('No Operations Manager (OM) found to review this report.');
        }
      }
    }
    
    const report = await this.prisma.workReport.create({
      data: {
        employeeId,
        reviewerId,
        department: employee.department?.name || 'Unassigned',
        reportType: dto.reportType,
        title: dto.title,
        content: dto.content || {},
        priority: dto.priority || ReportPriority.MEDIUM,
      }
    });

    // Notify OM
    if (reviewerId) {
      await this.notificationsService.createNotification(
        reviewerId,
        'New Work Report Submitted',
        `${employee.firstName} ${employee.lastName} has submitted a new ${dto.reportType}.`,
        'SYSTEM_ALERT' as any,
      );
    }

    return report;
  }

  async getMyReports(employeeId: string) {
    return this.prisma.workReport.findMany({
      where: { employeeId },
      orderBy: { submittedAt: 'desc' },
      include: { reviewer: { select: { firstName: true, lastName: true } } }
    });
  }

  async getTeamReports(reviewerId: string, role?: string) {
    // Strictly scope to reviewerId so global admins only see reports assigned to them in their dashboard
    const isGlobalAdmin = false;
    const whereClause: any = isGlobalAdmin ? {} : { reviewerId };
    whereClause.employeeId = { not: reviewerId };
    
    return this.prisma.workReport.findMany({
      where: whereClause,
      orderBy: { submittedAt: 'desc' },
      include: { 
        employee: { select: { firstName: true, lastName: true, photoUrl: true, employeeId: true } } 
      }
    });
  }

  async getReportById(id: string, employeeId: string, role?: string) {
    const report = await this.prisma.workReport.findUnique({
      where: { id },
      include: { employee: true, reviewer: true }
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    const isGlobalAdmin = role === 'OM' || role === 'SUPER_ADMIN' || role === 'CEO' || role === 'OPERATIONS_HEAD';

    // Ensure the requester is either the submitter, the reviewer, or a global admin
    if (report.employeeId !== employeeId && report.reviewerId !== employeeId && !isGlobalAdmin) {
      throw new ForbiddenException('Access denied to this report');
    }

    return report;
  }

  async reviewReport(reviewerId: string, role: string, reportId: string, status: ReportStatus, rejectionReason?: string) {
    const report = await this.prisma.workReport.findUnique({
      where: { id: reportId }
    });

    if (!report) throw new NotFoundException('Report not found');
    
    const isGlobalAdmin = role === 'CEO' || role === 'SUPER_ADMIN' || role === 'OPERATIONS_HEAD' || role === 'CEM' || role === 'OM' || role === 'CHRO' || role === 'HR';
    
    if (report.reviewerId !== reviewerId && !isGlobalAdmin) {
      throw new BadRequestException('Not authorized to review this report');
    }

    if (report.employeeId === reviewerId) {
      throw new ForbiddenException('Self-review is not permitted');
    }

    const updated = await this.prisma.workReport.update({
      where: { id: reportId },
      data: {
        status,
        rejectionReason,
        reviewedAt: new Date(),
        reviewerId: report.reviewerId || reviewerId,
      },
      include: { employee: true }
    });

    // Notify Submitter
    await this.notificationsService.createNotification(
      report.employeeId,
      `Report ${status}`,
      `Your report "${report.title}" has been ${status.toLowerCase()}. ${rejectionReason ? 'Reason: ' + rejectionReason : ''}`,
      'SYSTEM_ALERT' as any,
    );

    return updated;
  }

  private sanitizeCsvField(value: string | null | undefined): string {
    let val = value || '';
    if (/^[=\-+\@\t\r]/.test(val)) {
      val = "'" + val;
    }
    return `"${val.replace(/"/g, '""')}"`;
  }

  async exportTeamCsv(reviewerId: string, role?: string): Promise<string> {
    const isGlobalAdmin = role === 'CEO' || role === 'SUPER_ADMIN' || role === 'OPERATIONS_HEAD' || role === 'CEM' || role === 'OM' || role === 'CHRO' || role === 'HR';
    const whereClause: any = isGlobalAdmin ? {} : { reviewerId };
    whereClause.employeeId = { not: reviewerId };
    
    const reports = await this.prisma.workReport.findMany({
      where: whereClause,
      orderBy: { submittedAt: 'desc' },
      include: {
        employee: { select: { firstName: true, lastName: true, employeeId: true } }
      }
    });

    const headers = ['Employee ID', 'Employee Name', 'Department', 'Report Type', 'Title', 'Priority', 'Status', 'Submitted At', 'Reviewed At'];
    const rows = reports.map((r: any) => [
      r.employee?.employeeId || '',
      this.sanitizeCsvField(`${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`.trim()),
      this.sanitizeCsvField(r.department),
      this.sanitizeCsvField(r.reportType),
      this.sanitizeCsvField(r.title),
      this.sanitizeCsvField(r.priority),
      this.sanitizeCsvField(r.status),
      r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-IN') : '',
      r.reviewedAt  ? new Date(r.reviewedAt).toLocaleDateString('en-IN')  : '',
    ]);

    return [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
  }

  async resubmitReport(employeeId: string, reportId: string, updateDto: any) {
    const report = await this.prisma.workReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    if (report.employeeId !== employeeId) throw new ForbiddenException('You can only update your own reports');
    if (report.status !== ReportStatus.NEEDS_REVISION) throw new BadRequestException('Only reports needing revision can be updated');

    return this.prisma.workReport.update({
      where: { id: reportId },
      data: {
        title: updateDto.title || report.title,
        content: updateDto.content || report.content,
        status: ReportStatus.PENDING,
      }
    });
  }
}
