import { Injectable } from "@nestjs/common";
import { UserRole, Permission } from "@naprocs/types";

@Injectable()
export class RbacService {
  private readonly rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.EMPLOYEE]: [
      Permission.READ_OWN_PROFILE,
      Permission.WRITE_OWN_PROFILE,
    ],
    [UserRole.MANAGER]: [
      Permission.READ_OWN_PROFILE,
      Permission.WRITE_OWN_PROFILE,
      Permission.READ_TEAM_PROFILES,
    ],
    [UserRole.TEAM_LEAD]: [
      Permission.READ_OWN_PROFILE,
      Permission.WRITE_OWN_PROFILE,
      Permission.READ_TEAM_PROFILES,
    ],
    [UserRole.HR]: [
      Permission.READ_EMPLOYEES,
      Permission.WRITE_EMPLOYEES,
      Permission.READ_AUDIT,
    ],
    [UserRole.CHRO]: [
      Permission.READ_EMPLOYEES,
      Permission.WRITE_EMPLOYEES,
    ],
    [UserRole.SUPER_ADMIN]: [
      Permission.READ_EMPLOYEES,
      Permission.WRITE_EMPLOYEES,
      Permission.READ_AUDIT,
    ],
    [UserRole.FINANCE]: [
      Permission.READ_EMPLOYEES,
    ],
    [UserRole.CEO]: [
      Permission.READ_EMPLOYEES,
      Permission.WRITE_EMPLOYEES,
      Permission.READ_AUDIT,
    ],
    [UserRole.CTO]: [
      Permission.READ_EMPLOYEES,
      Permission.READ_AUDIT,
    ],
    [UserRole.COO]: [
      Permission.READ_EMPLOYEES,
    ],
    [UserRole.OPERATIONS_HEAD]: [
      Permission.READ_EMPLOYEES,
    ],
    [UserRole.CFO]: [
      Permission.READ_EMPLOYEES,
    ],
    [UserRole.IT]: [
      Permission.READ_EMPLOYEES,
    ],
    [UserRole.CAM]: [
      Permission.READ_EMPLOYEES,
    ],
    [UserRole.OE]: [
      Permission.READ_EMPLOYEES,
    ],
  };

  getPermissionsForRole(role: UserRole): Permission[] {
    const basePerms = this.rolePermissions[role] || [];
    // Universally grant own profile read access to all roles
    return Array.from(new Set([
      ...basePerms,
      Permission.READ_OWN_PROFILE,
    ]));
  }

  hasPermission(role: UserRole, requiredPermissions: Permission[]): boolean {
    const rolePerms = this.getPermissionsForRole(role);
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    return requiredPermissions.every((perm) => rolePerms.includes(perm));
  }
}
