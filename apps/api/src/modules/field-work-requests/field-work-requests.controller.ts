import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, Ip, BadRequestException, Res, Query } from "@nestjs/common";
import { FieldWorkRequestsService } from "./field-work-requests.service";
import { CreateFieldWorkRequestDto } from "./dto/create-field-work-request.dto";
import { UpdateFieldWorkRequestDto } from "./dto/update-field-work-request.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";

@Controller("field-work-requests")
@UseGuards(JwtAuthGuard, RbacGuard)
export class FieldWorkRequestsController {
  constructor(private readonly service: FieldWorkRequestsService) {}

  @Post()
  @Permissions(Permission.READ_OWN_PROFILE)
  async create(
    @Body() dto: CreateFieldWorkRequestDto,
    @Req() req: any
  ) {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      throw new BadRequestException("Employee details not found in session");
    }
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";
    return this.service.create(employeeId, dto, ipAddress);
  }

  @Get("my")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getMyRequests(@Req() req: any) {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      throw new BadRequestException("Employee details not found in session");
    }
    return this.service.getMyRequests(employeeId);
  }

  @Get("team")
  @Permissions(Permission.APPROVE_FIELD_REQUESTS)
  async getTeamApprovals(@Req() req: any) {
    const employeeId = req.user?.employeeId;
    const role = req.user?.role;
    if (!employeeId) {
      throw new BadRequestException("Employee details not found in session");
    }
    return this.service.getTeamApprovals(employeeId, role);
  }

  @Get("export")
  @Permissions(Permission.READ_OWN_PROFILE)
  async exportCsv(
    @Req() req: any, 
    @Res() res: any,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    const employeeId = req.user?.employeeId;
    const role = req.user?.role;
    if (!employeeId) {
      throw new BadRequestException("Employee details not found in session");
    }
    const csvData = await this.service.exportCsv(employeeId, role, startDate, endDate);
    res.set({
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=Field_Work_Requests_${new Date().toISOString().split("T")[0]}.csv`,
    });
    res.end(csvData);
  }


  @Get(":id")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getRequestDetails(
    @Param("id") id: string,
    @Req() req: any
  ) {
    const employeeId = req.user?.employeeId;
    const role = req.user?.role;
    if (!employeeId) {
      throw new BadRequestException("Employee details not found in session");
    }
    return this.service.getRequestDetails(id, employeeId, role);
  }

  @Patch(":id")
  @Permissions(Permission.READ_OWN_PROFILE)
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateFieldWorkRequestDto,
    @Req() req: any
  ) {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      throw new BadRequestException("Employee details not found in session");
    }
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";
    return this.service.update(id, employeeId, dto, ipAddress);
  }

  @Post(":id/approve")
  @Permissions(Permission.APPROVE_FIELD_REQUESTS)
  async approve(
    @Param("id") id: string,
    @Req() req: any
  ) {
    const employeeId = req.user?.employeeId;
    const role = req.user?.role;
    if (!employeeId) {
      throw new BadRequestException("Employee details not found in session");
    }
    return this.service.approve(id, employeeId, role);
  }

  @Post(":id/reject")
  @Permissions(Permission.APPROVE_FIELD_REQUESTS)
  async reject(
    @Param("id") id: string,
    @Body("reason") reason: string,
    @Req() req: any
  ) {
    const employeeId = req.user?.employeeId;
    const role = req.user?.role;
    if (!employeeId) {
      throw new BadRequestException("Employee details not found in session");
    }
    return this.service.reject(id, employeeId, role, reason);
  }

  @Delete(":id")
  @Permissions(Permission.READ_OWN_PROFILE)
  async delete(
    @Param("id") id: string,
    @Req() req: any
  ) {
    const employeeId = req.user?.employeeId;
    if (!employeeId) {
      throw new BadRequestException("Employee details not found in session");
    }
    return this.service.delete(id, employeeId);
  }

  @Get(":id/pdf")
  @Permissions(Permission.READ_OWN_PROFILE)
  async downloadPdf(
    @Param("id") id: string,
    @Req() req: any,
    @Res() res: any
  ) {
    const employeeId = req.user?.employeeId;
    const role = req.user?.role;
    if (!employeeId) {
      throw new BadRequestException("Employee details not found in session");
    }
    const pdfBuffer = await this.service.generatePdf(id, employeeId, role);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Field_Work_Request_${id}.pdf`,
      "Content-Length": pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
