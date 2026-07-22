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
    // Fetch the locally computed permissions for the role (which safely includes the universally granted ones without short-circuiting)
    const rolePermissions = this.getPermissionsForRole(role);

    // Cross-reference the required permissions against the actual computed permissions
    return requiredPermissions.some((perm) => rolePermissions.includes(perm));
  }
}