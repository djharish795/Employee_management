import { Controller, Post, Get, Patch, Body, Param, Req, UseGuards } from "@nestjs/common";
import { ConnectService } from "./connect.service";
import { CreateMeetRequestDto } from "./dto/create-meet-request.dto";
import { RescheduleMeetDto } from "./dto/reschedule-meet.dto";
import { UpdateConnectSettingsDto } from "./dto/update-connect-settings.dto";
import { CreateMeetNoteDto } from "./dto/create-meet-note.dto";
import { CreateMeetNoteCommentDto } from "./dto/create-meet-note-comment.dto";
import { Request } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller("connect")
@UseGuards(JwtAuthGuard, RbacGuard)
export class ConnectController {
  constructor(private readonly connectService: ConnectService) {}

  @RequirePermissions(RbacPermissions.CONNECT_MANAGE)
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
  async updateWorkspace(@Req() req: Request, @Param("id") id: string, @Body() dto: { agenda?: any; actionItems?: any }): Promise<any> {
    const user = req.user as any;
    return this.connectService.updateWorkspace(id, user, dto.agenda, dto.actionItems);
  }

  @Get("my-meetings")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getMyMeetings(@Req() req: Request) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.getMyMeetings(employeeId);
  }

  @Get("quick-contacts")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getQuickContacts(@Req() req: Request) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.getQuickContacts(employeeId);
  }

  @Get("goals")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getMyGoals(@Req() req: Request) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.getMyGoals(employeeId);
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

  @Get(":id/notes")
  @Permissions(Permission.READ_OWN_PROFILE)
  async getNotes(@Param("id") id: string, @Req() req: Request) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.getNotes(id, employeeId);
  }

  @Post(":id/notes")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async upsertNote(
    @Param("id") id: string,
    @Body() dto: CreateMeetNoteDto,
    @Req() req: Request
  ) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.upsertNote(id, employeeId, dto.content);
  }

  @Post("notes/:noteId/comments")
  @Permissions(Permission.WRITE_OWN_PROFILE)
  async addNoteComment(
    @Param("noteId") noteId: string,
    @Body() dto: CreateMeetNoteCommentDto,
    @Req() req: Request
  ) {
    const employeeId = (req.user as any).employeeId;
    return this.connectService.addNoteComment(noteId, employeeId, dto.content);
  }
}
