import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { maskEmployeePii } from "../../common/utils/pii-masker.util";
import { createS3Client, deleteFromS3 } from "../../common/utils/s3.util";
import { ErasureRequestStatus, DataErasureRequest } from "@naprocs/database";
import { AuditService } from "../audit/audit.service";
import { RedisService } from "../../redis/redis.service";

@Injectable()
export class ErasureService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private redisService: RedisService
  ) {}

  async getAllErasureRequests(): Promise<DataErasureRequest[]> {
    return this.prisma.dataErasureRequest.findMany({
      orderBy: { requestedAt: "desc" },
      include: {
        employee: {
          select: { firstName: true, lastName: true, photoUrl: true },
        },
      },
    });
  }

  async createErasureRequest(employeeId: string, notes?: string): Promise<DataErasureRequest> {
    // Ensure one doesn't already exist that's PENDING
    const existing = await this.prisma.dataErasureRequest.findFirst({
      where: { employeeId, status: ErasureRequestStatus.PENDING }
    });

    if (existing) {
      throw new BadRequestException("A pending erasure request already exists for this employee.");
    }

    const request = await this.prisma.dataErasureRequest.create({
      data: {
        employeeId,
        requestedById: employeeId,
        notes,
        status: ErasureRequestStatus.PENDING,
      }
    });

    await this.auditService.logCreate({
      moduleName: 'Compliance',
      entityId: request.id,
      actorId: employeeId,
      metadata: { action: 'CREATED_ERASURE_REQUEST' }
    });

    return request;
  }

  async processErasureRequest(id: string, approvedById: string, action: "APPROVE" | "REJECT"): Promise<DataErasureRequest> {
    const request = await this.prisma.dataErasureRequest.findUnique({
      where: { id },
    });

    if (!request) throw new NotFoundException("Erasure request not found");
    if (request.status !== ErasureRequestStatus.PENDING) {
      throw new BadRequestException(`Request is already ${request.status}`);
    }

    if (action === "REJECT") {
      const updated = await this.prisma.dataErasureRequest.update({
        where: { id },
        data: {
          status: ErasureRequestStatus.REJECTED,
          approvedById,
          processedAt: new Date(),
        },
      });

      await this.auditService.logUpdate({
        moduleName: 'Compliance',
        entityId: id,
        actorId: approvedById,
        metadata: { action: 'REJECTED_ERASURE_REQUEST' }
      });

      return updated;
    }

    // Fetch employee before masking to get their current document keys
    const employee = await this.prisma.employee.findUnique({
      where: { id: request.employeeId },
      select: { photoUrl: true, documents: true }
    });

    // Action is APPROVE -> Execute PII Masking
    const fieldsErased = await maskEmployeePii(this.prisma, request.employeeId);

    // Delete associated files from S3
    if (employee) {
      try {
        const s3 = createS3Client();
        const bucketName = (process.env.AWS_S3_BUCKET || "naprocs-ems-documents").trim();
        
        if (employee.photoUrl && !employee.photoUrl.startsWith('http')) {
          await deleteFromS3(s3, bucketName, employee.photoUrl);
        }
        
        if (employee.documents && Array.isArray(employee.documents)) {
          for (const doc of employee.documents as any[]) {
            if (doc && doc.s3Key) {
              await deleteFromS3(s3, bucketName, doc.s3Key);
            } else if (typeof doc === 'string' && !doc.startsWith('http')) {
              await deleteFromS3(s3, bucketName, doc);
            }
          }
        }
      } catch (err) {
        console.error("Failed to delete S3 objects during data erasure", err);
        // Continue erasure process even if S3 delete fails partially
      }
    }

    // Terminate active sessions for the erased employee
    const activeSessionKeys = await this.redisService.keys(`session:*:${request.employeeId}`);
    if (activeSessionKeys.length > 0) {
      await this.redisService.del(...activeSessionKeys);
    }

    const updated = await this.prisma.dataErasureRequest.update({
      where: { id },
      data: {
        status: ErasureRequestStatus.COMPLETED,
        approvedById,
        approvedAt: new Date(),
        processedAt: new Date(),
        fieldsErased: fieldsErased as any,
      },
    });

    await this.auditService.logUpdate({
      moduleName: 'Compliance',
      entityId: id,
      actorId: approvedById,
      metadata: { action: 'APPROVED_ERASURE_REQUEST' }
    });

    return updated;
  }
}
