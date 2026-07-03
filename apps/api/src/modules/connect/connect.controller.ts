import { Controller, Post, Get, Patch, Body, Param, Req, UseGuards } from "@nestjs/common";
import { ConnectService } from "./connect.service";
import { CreateMeetRequestDto } from "./dto/create-meet-request.dto";
import { RescheduleMeetDto } from "./dto/reschedule-meet.dto";
import { UpdateConnectSettingsDto } from "./dto/update-connect-settings.dto";
import { Request } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";

@Controller("connect")
@UseGuards(JwtAuthGuard, RbacGuard)
export class ConnectController {
  constructor(private readonly connectService: ConnectService) {}

  @Post("request")
  @Permissions(Permission.WRITE_OWN_PROFILE) // Any employee can create a meet
  async requestMeet(@Req() req: Request, @Body() dto: CreateMeetRequestDto) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.createMeetRequest(employeeId, dto);
  }

  @Post(":id/accept")
  @Permissions(Permission.WRITE_OWN_PROFILE) // Just need to be logged in, service checks if you are assignee
  async acceptMeet(@Req() req: Request, @Param("id") id: string) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.acceptMeetRequest(id, employeeId);
  }

  @Post(":id/reschedule")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async rescheduleMeet(@Req() req: Request, @Param("id") id: string, @Body() dto: RescheduleMeetDto) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.rescheduleMeet(id, employeeId, dto);
  }

  @Post(":id/reject")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async rejectMeet(@Req() req: Request, @Param("id") id: string) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.rejectMeet(id, employeeId);
  }

  @Patch(":id/workspace")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async updateWorkspace(@Req() req: Request, @Param("id") id: string, @Body() dto: { agenda?: any; actionItems?: any }) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.updateWorkspace(id, employeeId, dto.agenda, dto.actionItems);
  }

  @Get("my-meetings")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getMyMeetings(@Req() req: Request) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.getMyMeetings(employeeId);
  }

  @Get("availability/:employeeId")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getAvailability(@Param("employeeId") targetEmployeeId: string, @Req() req: Request) {
    const dateStr = req.query.date as string || new Date().toISOString();
    return this.connectService.getAvailability(targetEmployeeId, dateStr);
  }

  @Get("settings")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getSettings(@Req() req: Request) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.getSettings(employeeId);
  }

  @Post("settings")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async updateSettings(@Req() req: Request, @Body() dto: UpdateConnectSettingsDto) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.updateSettings(employeeId, dto);
  }
}
