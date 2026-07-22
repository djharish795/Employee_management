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

  async create(employeeId: string, dto: CreateWorkReportDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { department: true }
    });

    if (!employee) throw new NotFoundException('Employee not found');

    const reviewerId = employee.reportingManagerId;
    
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
    const isGlobalAdmin = role === 'CEO' || role === 'SUPER_ADMIN' || role === 'OPERATIONS_HEAD' || role === 'CEM' || role === 'OM' || role === 'CHRO' || role === 'HR';
    return this.prisma.workReport.findMany({
      where: isGlobalAdmin ? undefined : { reviewerId },
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

  async exportTeamCsv(reviewerId: string, role?: string): Promise<string> {
    const isGlobalAdmin = role === 'CEO' || role === 'SUPER_ADMIN' || role === 'OPERATIONS_HEAD' || role === 'CEM' || role === 'OM' || role === 'CHRO' || role === 'HR';
    const reports = await this.prisma.workReport.findMany({
      where: isGlobalAdmin ? undefined : { reviewerId },
      orderBy: { submittedAt: 'desc' },
      include: {
        employee: { select: { firstName: true, lastName: true, employeeId: true } }
      }
    });

    const headers = ['Employee ID', 'Employee Name', 'Department', 'Report Type', 'Title', 'Priority', 'Status', 'Submitted At', 'Reviewed At'];
    const rows = reports.map((r: any) => [
      r.employee?.employeeId || '',
      `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`.trim(),
      r.department || '',
      r.reportType || '',
      `"${(r.title || '').replace(/"/g, '""')}"`,
      r.priority || '',
      r.status || '',
      r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-IN') : '',
      r.reviewedAt  ? new Date(r.reviewedAt).toLocaleDateString('en-IN')  : '',
    ]);

    return [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
  }
}
