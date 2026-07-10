import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { maskEmployeePii } from "../../common/utils/pii-masker.util";
import { ErasureRequestStatus, DataErasureRequest } from "@naprocs/database";

@Injectable()
export class ErasureService {
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.dataErasureRequest.create({
      data: {
        employeeId,
        requestedById: employeeId,
        notes,
        status: ErasureRequestStatus.PENDING,
      }
    });
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
      return this.prisma.dataErasureRequest.update({
        where: { id },
        data: {
          status: ErasureRequestStatus.REJECTED,
          approvedById,
          processedAt: new Date(),
        },
      });
    }

    // Action is APPROVE -> Execute PII Masking
    const fieldsErased = await maskEmployeePii(this.prisma, request.employeeId);

    return this.prisma.dataErasureRequest.update({
      where: { id },
      data: {
        status: ErasureRequestStatus.COMPLETED,
        approvedById,
        approvedAt: new Date(),
        processedAt: new Date(),
        fieldsErased: fieldsErased as any,
      },
    });
  }
}
