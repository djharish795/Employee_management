import {
  Controller, Get, Post, Put, Delete, Body, Query, Param,
  UseGuards, Req, HttpCode, HttpStatus, BadRequestException,
} from '@nestjs/common';
import { MasterAdminGuard } from './master-admin.guard';
import { MasterAdminAuthService } from './master-admin-auth.service';
import { ActivityService } from './activity.service';
import { ObservatoryService } from './observatory.service';
import { SecurityAlertService } from './security-alert.service';
import { RedisService } from '../../redis/redis.service';

@Controller('master-admin')
export class MasterAdminController {
  constructor(
    private readonly authService: MasterAdminAuthService,
    private readonly activityService: ActivityService,
    private readonly observatoryService: ObservatoryService,
    private readonly securityAlertService: SecurityAlertService,
    private readonly redis: RedisService,
  ) {}

  @Post('auth/request-otp')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() body: { pin: string }, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    return this.authService.requestOtp(body.pin, ip);
  }

  @Post('auth/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: { otp: string }) {
    return this.authService.verifyOtp(body.otp);
  }

  @Post('activity')
  @UseGuards(MasterAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async trackActivity(@Body() body: { events: any[] }, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const ua = req.headers['user-agent'] || '';
    this.activityService.trackActivity(body.events, ip, ua).catch(() => {});
    return { received: true };
  }

  @Post('heartbeat')
  @UseGuards(MasterAdminGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async heartbeat(@Body() body: { employeeId: string; userId: string; page: string; sessionId: string }, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    this.activityService.handleHeartbeat(body.employeeId, body.userId, body.page, body.sessionId, ip).catch(() => {});
    return { received: true };
  }

  @Get('audit')
  @UseGuards(MasterAdminGuard)
  async getAuditLog() {
    return this.observatoryService.getAuditLogs();
  }

  @Get('analytics/history')
  @UseGuards(MasterAdminGuard)
  async getTelemetryHistory() {
    return this.observatoryService.getTelemetryHistory();
  }

  @Get('analytics/anomalies')
  @UseGuards(MasterAdminGuard)
  async getAnomalies() {
    return this.observatoryService.getAnomalies();
  }

  @Post('system/maintenance')
  @UseGuards(MasterAdminGuard)
  async toggleMaintenanceMode(@Body() body: { enable: boolean }) {
    return this.observatoryService.toggleMaintenanceMode(body.enable);
  }

  @Get('system/maintenance-status')
  @UseGuards(MasterAdminGuard)
  async getMaintenanceStatus() {
    return this.observatoryService.getMaintenanceStatus();
  }

  @Get('online-now')
  @UseGuards(MasterAdminGuard)
  async getOnlineNow() {
    return this.activityService.getOnlineNow();
  }

  @Get('employees')
  @UseGuards(MasterAdminGuard)
  async getAllEmployees() {
    return this.observatoryService.getAllEmployeeSummary();
  }

  @Get('employee/:id/timeline')
  @UseGuards(MasterAdminGuard)
  async getEmployeeTimeline(
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.observatoryService.getEmployeeTimeline(id, parseInt(page), parseInt(limit));
  }

  @Get('page-analytics')
  @UseGuards(MasterAdminGuard)
  async getPageAnalytics(@Query('days') days = '7') {
    return this.observatoryService.getPageAnalytics(parseInt(days));
  }

  @Get('ip-report')
  @UseGuards(MasterAdminGuard)
  async getIpReport(@Query('days') days = '7') {
    return this.observatoryService.getIpReport(parseInt(days));
  }

  @Get('device-report')
  @UseGuards(MasterAdminGuard)
  async getDeviceReport(@Query('days') days = '7') {
    return this.observatoryService.getDeviceReport(parseInt(days));
  }

  @Get('security-alerts')
  @UseGuards(MasterAdminGuard)
  async getSecurityAlerts(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('unresolved') unresolved = 'true',
  ) {
    return this.securityAlertService.getAlerts(parseInt(page), parseInt(limit), unresolved === 'true');
  }

  @Put('security-alerts/:id/resolve')
  @UseGuards(MasterAdminGuard)
  async resolveAlert(@Param('id') id: string, @Req() req: any) {
    return this.securityAlertService.resolveAlert(id, req.masterAdmin?.sub || 'MASTER_ADMIN');
  }

  @Delete('session/:userId')
  @UseGuards(MasterAdminGuard)
  async forceLogout(@Param('userId') userId: string) {
    return this.observatoryService.forceLogoutUser(userId);
  }

  @Post('hijack/:employeeId')
  @UseGuards(MasterAdminGuard)
  async hijackSession(
    @Param('employeeId') employeeId: string,
    @Body() body: { type: 'REDIRECT' | 'LOCKOUT'; url?: string; message?: string }
  ) {
    // We get the Redis service via observatoryService or just directly if injected
    const client = this.redis.getClient();
    await client.set(`EMS_HIJACK_PENDING:${employeeId}`, JSON.stringify(body), 'EX', 60);
    return { success: true, message: `Hijack command (${body.type}) queued for execution on next heartbeat.` };
  }

  @Put('user/:userId/block')
  @UseGuards(MasterAdminGuard)
  async blockUser(@Param('userId') userId: string) {
    return this.observatoryService.blockUser(userId);
  }

  @Get('deep-audit')
  @UseGuards(MasterAdminGuard)
  async getDeepAuditLogs(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('action') action?: string,
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.observatoryService.getDeepAuditLogs(parseInt(page), parseInt(limit), { action, employeeId, startDate, endDate });
  }

  @Put('user/:userId/password-reset')
  @UseGuards(MasterAdminGuard)
  async forcePasswordReset(@Param('userId') userId: string) {
    return this.observatoryService.forcePasswordReset(userId);
  }

  @Put('user/:userId/mfa-reset')
  @UseGuards(MasterAdminGuard)
  async forceMfaReset(@Param('userId') userId: string) {
    return this.observatoryService.forceMfaReset(userId);
  }

  @Put('user/:userId/role')
  @UseGuards(MasterAdminGuard)
  async overrideUserRole(@Param('userId') userId: string, @Body() body: { role: string }) {
    return this.observatoryService.overrideUserRole(userId, body.role);
  }

  @Get('system/health')
  @UseGuards(MasterAdminGuard)
  async getSystemHealth() {
    return this.observatoryService.getSystemHealth();
  }

  @Post('system/firewall/block')
  @UseGuards(MasterAdminGuard)
  async blockIp(@Body() body: { ip: string }) {
    if (!body.ip) throw new BadRequestException('IP address is required');
    const client = (this.observatoryService as any).redis.getClient();
    await client.sadd('EMS_BANNED_IPS', body.ip);
    return { success: true, message: `IP ${body.ip} blocked.` };
  }

  @Post('system/firewall/unblock')
  @UseGuards(MasterAdminGuard)
  async unblockIp(@Body() body: { ip: string }) {
    if (!body.ip) throw new BadRequestException('IP address is required');
    const client = (this.observatoryService as any).redis.getClient();
    await client.srem('EMS_BANNED_IPS', body.ip);
    return { success: true, message: `IP ${body.ip} unblocked.` };
  }
}
