import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PutObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client } from '../../common/utils/s3.util';
import { v4 as uuidv4 } from 'uuid';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  private readonly bucketName: string;
  private readonly s3: S3Client;

  constructor(private prisma: PrismaService) {
    this.bucketName = (process.env.AWS_S3_BUCKET || 'naprocs-ems-documents').trim();
    this.s3 = createS3Client();
  }

  async generateReport(type: string, format: string, generatedById: string) {
    let buffer: Buffer;
    let fileName = `report-${type.toLowerCase()}-${Date.now()}`;
    let name = '';

    if (type === 'HEADCOUNT') {
      name = 'Headcount Summary';
      if (format === 'PDF') {
        buffer = await this.generateHeadcountPDF();
      } else {
        const employees = await this.prisma.employee.findMany({
          include: { department: true, designation: true },
        });
        buffer = await this.generateHeadcountXLSX(employees);
      }
    } else if (type === 'ATTENDANCE') {
      name = 'Attendance Summary';
      // For simplicity, just generating a basic report from employees list
      if (format === 'PDF') {
        buffer = await this.generateBasicPDF('Attendance Summary', 'Attendance data will be populated here.');
      } else {
        buffer = await this.generateBasicXLSX('Attendance Summary');
      }
    } else if (type === 'ORG_STRUCTURE') {
      name = 'Org Structure Report';
      if (format === 'PDF') {
        buffer = await this.generateBasicPDF('Org Structure Report', 'Org structure data will be populated here.');
      } else {
        buffer = await this.generateBasicXLSX('Org Structure Report');
      }
    } else {
      throw new InternalServerErrorException('Invalid report type');
    }

    fileName += format === 'PDF' ? '.pdf' : '.xlsx';
    const contentType = format === 'PDF' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const objectKey = `reports/${uuidv4()}-${fileName}`;

    await this.uploadBufferToS3(buffer, objectKey, contentType);

    const report = await this.prisma.reportHistory.create({
      data: {
        name,
        type: type as any,
        format: format as any,
        s3Key: objectKey,
        sizeBytes: buffer.length,
        generatedById,
      },
    });

    return report;
  }

  async getRecentReports(generatedById: string) {
    return this.prisma.reportHistory.findMany({
      orderBy: { generatedAt: 'desc' },
      take: 20,
    });
  }

  async getDownloadUrl(reportId: string) {
    const report = await this.prisma.reportHistory.findUnique({
      where: { id: reportId },
    });

    if (!report) throw new NotFoundException('Report not found');

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: report.s3Key,
    });

    const url = await getSignedUrl(this.s3, command, { expiresIn: 900 });
    return { url };
  }

  private async uploadBufferToS3(buffer: Buffer, key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    await this.s3.send(command);
  }

  private async generateHeadcountPDF(): Promise<Buffer> {
    const counts = await this.prisma.employee.groupBy({
      by: ['departmentId'],
      _count: true,
    });
    const deptsRaw = await this.prisma.department.findMany();
    const deptMap = new Map(deptsRaw.map(d => [d.id, d.name]));

    const depts: Record<string, number> = {};
    let totalEmployees = 0;
    counts.forEach(c => {
      const dName = c.departmentId ? (deptMap.get(c.departmentId) || 'Unknown') : 'Unassigned';
      depts[dName] = (depts[dName] || 0) + c._count;
      totalEmployees += c._count;
    });

    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text('Headcount Summary', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Total Employees: ${totalEmployees}`);
      doc.moveDown();

      doc.fontSize(14).text('By Department:');
      doc.fontSize(12);
      for (const [dept, count] of Object.entries(depts)) {
        doc.text(`- ${dept}: ${count}`);
      }

      doc.end();
    });
  }

  private async generateHeadcountXLSX(employees: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Headcount');

    sheet.columns = [
      { header: 'Employee ID', key: 'empId', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Department', key: 'dept', width: 25 },
      { header: 'Designation', key: 'designation', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    employees.forEach((e) => {
      sheet.addRow({
        empId: e.employeeId,
        name: `${e.firstName} ${e.lastName}`,
        dept: e.department?.name || 'Unassigned',
        designation: e.designation?.title || 'N/A',
        status: e.status,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private async generateBasicPDF(title: string, content: string): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(content);
      doc.end();
    });
  }

  private async generateBasicXLSX(title: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');
    sheet.addRow([title]);
    sheet.addRow(['Data will be populated here']);
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
