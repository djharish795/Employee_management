import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller('settings')
@UseGuards(JwtAuthGuard, RbacGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @RequirePermissions(RbacPermissions.SETTINGS_VIEW)
  @Get('dashboard')
  @Permissions(Permission.ACCESS_SETTINGS)
  getDashboard() {
    return this.settingsService.getDashboardMetrics();
  }

  @RequirePermissions(RbacPermissions.SETTINGS_VIEW)
  @Get('permissions')
  @Permissions(Permission.ACCESS_SETTINGS)
  getPermissions() {
    return this.settingsService.getPermissions();
  }

  @RequirePermissions(RbacPermissions.SETTINGS_VIEW)
  @Get('health')
  @Permissions(Permission.ACCESS_SETTINGS)
  getHealth() {
    return this.settingsService.getHealth();
  }

  @RequirePermissions(RbacPermissions.SETTINGS_VIEW)
  @Get('policy')
  @Permissions(Permission.ACCESS_SETTINGS)
  getPolicy() {
    return this.settingsService.getOrgPolicy();
  }

  @RequirePermissions(RbacPermissions.SETTINGS_MANAGE)
  @Put('policy')
  @Permissions(Permission.ACCESS_SETTINGS)
  updatePolicy(@Body() body: any, @Req() req: Request) {
    const employeeId = (req as any).user?.employeeId;
    return this.settingsService.updateOrgPolicy(body, employeeId);
  }

  @RequirePermissions(RbacPermissions.SETTINGS_VIEW)
  @Get('matrix')
  @Permissions(Permission.ACCESS_SETTINGS)
  getMatrix() {
    return this.settingsService.getApprovalMatrix();
  }

  @RequirePermissions(RbacPermissions.SETTINGS_MANAGE)
  @Put('matrix')
  @Permissions(Permission.ACCESS_SETTINGS)
  updateMatrix(@Body() body: any[]) {
    return this.settingsService.updateApprovalMatrix(body);
  }

  @RequirePermissions(RbacPermissions.SETTINGS_VIEW)
  @Get('org-profile')
  @Permissions(Permission.ACCESS_SETTINGS)
  getOrgProfile() {
    return this.settingsService.getOrgProfile();
  }

  @RequirePermissions(RbacPermissions.SETTINGS_MANAGE)
  @Put('org-profile')
  @Permissions(Permission.ACCESS_SETTINGS)
  updateOrgProfile(@Body() body: any, @Req() req: Request) {
    const employeeId = (req as any).user?.employeeId;
    return this.settingsService.updateOrgProfile(body, employeeId);
  }
  @RequirePermissions(RbacPermissions.SETTINGS_VIEW)
  @Get('email-templates')
  @Permissions(Permission.ACCESS_SETTINGS)
  getEmailTemplates() {
    return this.settingsService.getEmailTemplates();
  }

  @RequirePermissions(RbacPermissions.SETTINGS_MANAGE)
  @Put('email-templates/:id')
  @Permissions(Permission.ACCESS_SETTINGS)
  updateEmailTemplate(@Req() req: Request, @Body() body: { subject: string; bodyHtml: string }) {
    const id = req.params.id;
    const employeeId = (req as any).user?.employeeId;
    return this.settingsService.updateEmailTemplate(id, body, employeeId);
  }
}
