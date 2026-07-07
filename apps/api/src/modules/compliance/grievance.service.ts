import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GrievanceService {
  constructor(private prisma: PrismaService) {}

  async getAllGrievanceCases() {
    return this.prisma.grievanceCase.findMany({
      orderBy: { openedAt: "desc" },
      include: {
        employee: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }
}
