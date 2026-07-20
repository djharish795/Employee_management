import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CrmService } from "./crm.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { CreateRequirementDto } from "./dto/create-requirement.dto";
import { UpdateRequirementDto } from "./dto/update-requirement.dto";
import { CreateMeetingDto } from "./dto/create-meeting.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RbacGuard } from "../../common/guards/rbac.guard";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { Permission } from "@naprocs/types";

@Controller("crm")
@UseGuards(JwtAuthGuard, RbacGuard)
export class CrmController {
  constructor(private readonly service: CrmService) { }

  @Get("clients")
  @Permissions(Permission.READ_EMPLOYEES)
  async getClients() {
    return this.service.getClients();
  }

  @Get("activity")
  @Permissions(Permission.READ_EMPLOYEES)
  async getRecentActivity() {
    return this.service.getRecentActivity();
  }

  @Get("reports/pipeline-summary")
  @Permissions(Permission.READ_EMPLOYEES)
  async getPipelineSummary() {
    return this.service.getPipelineSummary();
  }

  @Get("reports/lead-activity")
  @Permissions(Permission.READ_EMPLOYEES)
  async getLeadActivityReport() {
    return this.service.getLeadActivityReport();
  }


  @Get("clients/incoming")
  @Permissions(Permission.READ_EMPLOYEES)
  async getIncomingClients() {
    return this.service.getIncomingClients();
  }

  @Post("clients")
  @Permissions(Permission.READ_EMPLOYEES)
  async createClient(@Body() dto: CreateClientDto, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.createClient(dto, actorId);
  }

  @Post("clients/:id/accept")
  @Permissions(Permission.READ_EMPLOYEES)
  async acceptClient(@Param("id") id: string, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.acceptClient(id, actorId);
  }

  @Post("clients/:id/clarify")
  @Permissions(Permission.READ_EMPLOYEES)
  async clarifyClient(@Param("id") id: string, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.clarifyClient(id, actorId);
  }

  @Post("clients/:id/reject")
  @Permissions(Permission.READ_EMPLOYEES)
  async rejectClient(@Param("id") id: string, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.rejectClient(id, actorId);
  }

  @Post("clients/:id/transfer-to-crm")
  @Permissions(Permission.READ_EMPLOYEES)
  async transferToCrm(@Param("id") id: string, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.transferToCrm(id, actorId);
  }

  @Put("clients/:id/stage")
  @Permissions(Permission.READ_EMPLOYEES)
  async updateClientStage(
    @Param("id") id: string,
    @Body("stage") stage: number,
    @Req() req: any
  ) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.updateClientStage(id, stage, actorId);
  }

  @Put("clients/:id/health")
  @Permissions(Permission.READ_EMPLOYEES)
  async updateClientHealth(
    @Param("id") id: string,
    @Body("health") health: string,
    @Req() req: any
  ) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.updateClientHealth(id, health, actorId);
  }

  @Post("clients/:id/close-deal")
  @Permissions(Permission.READ_EMPLOYEES)
  async closeDeal(
    @Param("id") id: string,
    @Req() req: any
  ) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.closeDeal(id, actorId);
  }

  @Post("clients/:id/notes")
  @Permissions(Permission.READ_EMPLOYEES)
  async addClientNote(
    @Param("id") id: string,
    @Body("note") note: string,
    @Req() req: any
  ) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.addClientNote(id, note, actorId);
  }

  @Post("clients/:id/calls")
  @Permissions(Permission.READ_EMPLOYEES)
  async addClientCall(
    @Param("id") id: string,
    @Body("call") call: string,
    @Req() req: any
  ) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.addClientCall(id, call, actorId);
  }

  @Post("clients/:id/requirements")
  @Permissions(Permission.READ_EMPLOYEES)
  async addClientRequirement(
    @Param("id") id: string,
    @Body() item: any,
    @Req() req: any
  ) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.addClientRequirement(id, item, actorId);
  }

  @Put("clients/:id/requirements/:reqId/status")
  @Permissions(Permission.READ_EMPLOYEES)
  async updateClientRequirementStatus(
    @Param("id") id: string,
    @Param("reqId") reqId: string,
    @Body("status") status: string,
    @Req() req: any
  ) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.updateClientRequirementStatus(id, reqId, status, actorId);
  }

  @Post("clients/:id/change-requests")
  @Permissions(Permission.READ_EMPLOYEES)
  async addClientChangeRequest(
    @Param("id") id: string,
    @Body() item: any,
    @Req() req: any
  ) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.addClientChangeRequest(id, item, actorId);
  }

  @Put("clients/:id/change-requests/:crId/status")
  @Permissions(Permission.READ_EMPLOYEES)
  async updateClientChangeRequestStatus(
    @Param("id") id: string,
    @Param("crId") crId: string,
    @Body("status") status: string,
    @Req() req: any
  ) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.updateClientChangeRequestStatus(id, crId, status, actorId);
  }

  @Post("clients/:id/attachments")
  @Permissions(Permission.READ_EMPLOYEES)
  async addClientAttachment(
    @Param("id") id: string,
    @Body("attachment") attachment: string,
    @Req() req: any
  ) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.addClientAttachment(id, attachment, actorId);
  }

  @Get("requirements")
  @Permissions(Permission.READ_EMPLOYEES)
  async getRequirements() {
    return this.service.getRequirements();
  }

  @Post("requirements")
  @Permissions(Permission.READ_EMPLOYEES)
  async createRequirement(@Body() dto: CreateRequirementDto, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.createRequirement(dto, actorId);
  }

  @Put("requirements/:id")
  @Permissions(Permission.READ_EMPLOYEES)
  async updateRequirement(
    @Param("id") id: string,
    @Body() dto: UpdateRequirementDto,
    @Req() req: any
  ) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.updateRequirement(id, dto, actorId);
  }

  @Put("requirements/:id/status")
  @Permissions(Permission.READ_EMPLOYEES)
  async updateRequirementStatus(
    @Param("id") id: string,
    @Body("status") status: string,
    @Req() req: any
  ) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.updateRequirementStatus(id, status, actorId);
  }

  @Delete("requirements/:id")
  @Permissions(Permission.READ_EMPLOYEES)
  async deleteRequirement(@Param("id") id: string, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.deleteRequirement(id, actorId);
  }

  // CRM Meetings
  @Get("meetings")
  @Permissions(Permission.READ_EMPLOYEES)
  async getMeetings() {
    return this.service.getAllMeetings();
  }

  @Get("clients/:id/meetings")
  @Permissions(Permission.READ_EMPLOYEES)
  async getClientMeetings(@Param("id") id: string) {
    return this.service.getClientMeetings(id);
  }

  @Post("meetings")
  @Permissions(Permission.READ_EMPLOYEES)
  async createMeeting(@Body() dto: CreateMeetingDto, @Req() req: any) {
    const actorId = req.user?.employeeId || req.user?.id;
    return this.service.createMeeting(dto, actorId);
  }
}
