import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
