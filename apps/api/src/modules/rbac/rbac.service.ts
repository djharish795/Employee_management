import { Injectable } from "@nestjs/common";
import { UserRole, Permission, hasPermission as checkPermission, ROLE_PERMISSIONS } from "@naprocs/types";

@Injectable()
export class RbacService {
  getPermissionsForRole(role: UserRole): Permission[] {
    const basePerms = ROLE_PERMISSIONS[role] || [];
    // Universally grant own profile read/write access to all roles
    return Array.from(new Set([
      ...basePerms,
      Permission.READ_OWN_PROFILE,
      Permission.WRITE_OWN_PROFILE,
    ]));
  }

  hasPermission(role: UserRole, requiredPermissions: Permission[]): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    return requiredPermissions.some((perm) => {
      // Force allow own profile read/write here to bypass shared package compilation sync issues
      if (perm === Permission.READ_OWN_PROFILE || perm === Permission.WRITE_OWN_PROFILE) return true;
      return checkPermission(role, perm);
    });
  }
}