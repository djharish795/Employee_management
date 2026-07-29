import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission, UserRole } from "@naprocs/types";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { REQUIRE_PERMISSIONS_KEY } from "../rbac/require-permissions.decorator";
import { RbacService } from "../../modules/rbac/rbac.service";
import { RbacRolePermissionsMapping, RbacPermissionType, RbacRoleType } from "../rbac/rbac.config";

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredLegacyPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredV2Permissions = this.reflector.getAllAndOverride<RbacPermissionType[]>(REQUIRE_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const hasLegacy = requiredLegacyPermissions && requiredLegacyPermissions.length > 0;
    const hasV2 = requiredV2Permissions && requiredV2Permissions.length > 0;

    if (!hasLegacy && !hasV2) {
      throw new ForbiddenException("No permissions defined for this route (fail-closed)");
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.role) {
      throw new ForbiddenException("User role not found in request payload");
    }

    let legacyGranted = true;
    let v2Granted = true;

    if (hasLegacy) {
      legacyGranted = this.rbacService.hasPermission(user.role as UserRole, requiredLegacyPermissions);
    }

    if (hasV2) {
      const userRole = user.role as RbacRoleType;
      const allowedV2Perms = RbacRolePermissionsMapping[userRole] || [];
      v2Granted = requiredV2Permissions!.some((perm) => allowedV2Perms.includes(perm));
    }
    
    if (!legacyGranted || !v2Granted) {
      throw new ForbiddenException("Insufficient permissions to access this resource");
    }

    return true;
  }
}
