import { Controller, Get, Put, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '@naprocs/types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { RequirePermissions } from '../../common/rbac/require-permissions.decorator';
import { RbacPermissions } from '../../common/rbac/rbac.config';

@Controller('profile')
@UseGuards(JwtAuthGuard, RbacGuard)
@UseInterceptors(AuditInterceptor)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @RequirePermissions(RbacPermissions.PROFILE_READ)
  @Get('me')
  @Permissions(Permission.READ_OWN_PROFILE)
  getMyProfile(@CurrentUser() user: any): Promise<any> {
    return this.profileService.getMyProfile(user.employeeId);
  }

  @Put('me')
  @Permissions(Permission.WRITE_OWN_PROFILE)
  updateMyProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto): Promise<any> {
    return this.profileService.updateMyProfile(user.employeeId, dto);
  }

  @Post('change-password')
  @Permissions(Permission.WRITE_OWN_PROFILE)
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.profileService.changePassword(user.userId, dto);
  }
}
